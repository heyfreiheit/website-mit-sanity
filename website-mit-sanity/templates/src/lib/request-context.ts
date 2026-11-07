import {AsyncLocalStorage} from 'node:async_hooks'
import {createHash} from 'node:crypto'

export const DRAFT_COOKIE = 'sanity-draft-mode'
export const requestContext = new AsyncLocalStorage<{draft: boolean}>()
export const isDraft = () => requestContext.getStore()?.draft ?? false

/** Cookie value only the server can produce (derived from the read token), so
 *  setting the cookie by hand does not reveal unpublished drafts. */
export function draftCookieValue(): string | null {
  const token = (import.meta.env.DEV ? import.meta.env.SANITY_API_READ_TOKEN : process.env.SANITY_API_READ_TOKEN) as string | undefined
  return token ? createHash('sha256').update(`draft-mode:${token}`).digest('hex').slice(0, 40) : null
}
