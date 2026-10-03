/**
 * Limits shared by the AI chat client and src/app/api/ai/chat.
 *
 * Both sides need the same numbers: the server rejects anything larger, and
 * the client trims its history so a long conversation never trips the limit.
 */

export const AI_MAX_TURNS = 20
export const AI_MAX_CONTENT_LENGTH = 4000
export const AI_REQUESTS_PER_MINUTE = 20
