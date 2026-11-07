// Called by the Studio (Presentation tool) with a one-time secret. Only a valid
// secret turns draft mode on, so nobody can switch the public site to drafts.
import type {APIRoute} from 'astro'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {draftClient} from '../../../lib/content'
import {DRAFT_COOKIE, draftCookieValue} from '../../../lib/request-context'

export const GET: APIRoute = async ({request, cookies, redirect}) => {
  if (!draftClient) return new Response('Draft mode is not configured (SANITY_API_READ_TOKEN missing).', {status: 500})
  const {isValid, redirectTo = '/'} = await validatePreviewUrl(draftClient, request.url)
  if (!isValid) return new Response('Invalid secret', {status: 401})
  cookies.set(DRAFT_COOKIE, draftCookieValue()!, {path: '/', httpOnly: true, sameSite: 'none', secure: true})
  return redirect(redirectTo, 307)
}
