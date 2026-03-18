/**
 * shell.tsx — backwards-compatible re-export.
 *
 * All components have been moved to src/components/shell/:
 *   sidebar.tsx       → Sidebar
 *   bottom-nav.tsx    → BottomNav
 *   mobile-header.tsx → MobileHeader
 *   avatar.tsx        → Avatar
 *   page-shell.tsx    → PageShell
 *   ui.tsx            → StatusBadge, CategoryBadge, StatCard, EmptyState, StarRating, SeeAllLink
 *
 * Existing imports like `import { PageShell } from '@/components/shell'` continue to work.
 */
export * from './shell/index'
