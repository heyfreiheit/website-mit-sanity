// Draft mode: the Studio's Presentation tool sets a cookie through
// /api/draft-mode/enable. Requests with that cookie render unpublished drafts
// with click-to-edit overlays; everyone else gets the published site.
import {defineMiddleware} from 'astro:middleware'
import {requestContext, DRAFT_COOKIE, draftCookieValue} from './lib/request-context'

export const onRequest = defineMiddleware((ctx, next) => {
  const expected = draftCookieValue()
  const draft = expected !== null && ctx.cookies.get(DRAFT_COOKIE)?.value === expected
  ctx.locals.draft = draft
  return requestContext.run({draft}, () => next())
})
