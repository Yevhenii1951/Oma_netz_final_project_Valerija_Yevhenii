/**
 * Every form control needs an accessible name.
 *
 * A visible `<label>` next to an input is not enough: a screen reader only
 * announces the label if it is associated, either by `htmlFor` matching the
 * input's `id` or by wrapping the control. Twenty-five controls across ten
 * files had the label text right there in the markup and no association at all,
 * so they were announced as bare "edit field".
 *
 * This reads the source instead of a rendered DOM, because the failure is in
 * the markup. It walks the components and fails with the exact file and line,
 * so a control added without a label fails the build rather than the review.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return sourceFiles(path)
		return entry.name.endsWith('.tsx') ? [path] : []
	})
}

const CONTROL = /<(input|select|textarea)\b([^>]*?)\/?>/g
const CONTROL_OPEN = /<(input|select|textarea)\b/g

/** The ids that some `htmlFor` in the same file points at. */
function labelledIds(source: string): Set<string> {
	const ids = new Set<string>()
	for (const match of source.matchAll(
		/<label\b[^>]*\bhtmlFor=['"]([^'"]+)['"]/g,
	)) {
		ids.add(match[1]!)
	}
	return ids
}

/** Controls sitting inside a <label>…</label> are named implicitly. */
function wrappedPositions(source: string): [number, number][] {
	// The labels here run over several lines, so this has to span newlines.
	const label = /<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?<\/label>/g
	return [...source.matchAll(label)].map(
		m => [m.index!, m.index! + m[0].length] as [number, number],
	)
}

/** The findings for one file's source, so the rule itself can be tested. */
function findingsIn(relative: string, source: string): Finding[] {
	const findings: Finding[] = []
	{
		const labelIds = labelledIds(source)
		const wrapped = wrappedPositions(source)

		for (const match of source.matchAll(CONTROL)) {
			const [, tag, attributes] = match
			const position = match.index!

			// Hidden fields are not announced, so they need no name.
			if (/\btype=['"]hidden['"]/.test(attributes)) continue

			const hasAria =
				/\baria-label(?:ledby)?=/.test(attributes) || /\btitle=/.test(attributes)
			if (hasAria) continue

			if (wrapped.some(([start, end]) => position > start && position < end)) {
				continue
			}

			const id = attributes.match(/\bid=['"]([^'"]+)['"]/)?.[1]
			if (id && labelIds.has(id)) continue

			const hint = attributes.match(/\bname=['"]([^'"]+)['"]/)?.[1]
			findings.push({
				file: relative,
				line: source.slice(0, position).split('\n').length,
				detail: `<${tag}${hint ? ` name="${hint}"` : ''}> has no label`,
			})
		}
	}

	return findings
}

type Finding = { file: string; line: number; detail: string }

function accessibleNameFindings(): Finding[] {
	return sourceFiles(SRC).flatMap(path =>
		findingsIn(path.slice(process.cwd().length + 1), readFileSync(path, 'utf8')),
	)
}

describe('form controls', () => {
	const findings = accessibleNameFindings()

	it('all have an accessible name', () => {
		const report = findings
			.map(f => `  ${f.file}:${f.line}  ${f.detail}`)
			.join('\n')
		expect(
			findings,
			`These controls are announced without a name. Add id="..." and htmlFor="..." on the label, or wrap the control in its label:\n${report}`,
		).toEqual([])
	})

	it('are found by this check at all, so it cannot pass vacuously', () => {
		// Guards against the regex breaking and the suite going green for the
		// wrong reason. There are 28 form controls in the app today, and this
		// count has to keep up when one is added.
		const controls = sourceFiles(SRC).reduce((sum, path) => {
			const source = readFileSync(path, 'utf8')
			return sum + [...source.matchAll(CONTROL_OPEN)].length
		}, 0)
		expect(controls).toBeGreaterThanOrEqual(28)
	})
})
describe('the check itself', () => {
	// Written after the rule shipped one false negative that made the whole
	// suite pass, so the rule is pinned against markup both ways.

	it('flags a visible label that is not associated', () => {
		const found = findingsIn(
			'test.tsx',
			`<label className='x'>E-Mail</label>\n<input type='email' />`,
		)
		expect(found).toHaveLength(1)
		expect(found[0]?.detail).toContain('<input>')
	})

	it('accepts htmlFor pointing at the id', () => {
		expect(
			findingsIn(
				'test.tsx',
				`<label htmlFor='mail'>E-Mail</label>\n<input id='mail' type='email' />`,
			),
		).toEqual([])
	})

	it('accepts a control wrapped in its label', () => {
		expect(
			findingsIn(
				'test.tsx',
				`<label className='relative'>\n\t<Search />\n\t<input value='q' />\n</label>`,
			),
		).toEqual([])
	})

	it('accepts aria-label, which is a name in its own right', () => {
		expect(
			findingsIn('test.tsx', `<input aria-label='Nachricht' placeholder='schreiben…' />`),
		).toEqual([])
	})

	it('ignores hidden fields, which are never announced', () => {
		expect(findingsIn('test.tsx', `<input type='hidden' name='csrf' />`)).toEqual([])
	})

	it('does not credit an id that no label points at', () => {
		expect(
			findingsIn(
				'test.tsx',
				`<label htmlFor='other'>E-Mail</label>\n<input id='mail' />`,
			),
		).toHaveLength(1)
	})

	it('sees attributes that run over several lines', () => {
		expect(
			findingsIn(
				'test.tsx',
				`<label htmlFor='mail'>\n\tE-Mail\n</label>\n<input\n\tid='mail'\n\ttype='email'\n/>`,
			),
		).toEqual([])
	})

	it('finds every control in a file, not just the first', () => {
		expect(
			findingsIn('test.tsx', `<input />\n<input />\n<input />`).length,
		).toBe(3)
	})
})
