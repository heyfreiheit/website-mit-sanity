import type {APIRoute} from 'astro'
import {DRAFT_COOKIE} from '../../../lib/request-context'

export const GET: APIRoute = ({cookies, redirect, url}) => {
  cookies.delete(DRAFT_COOKIE, {path: '/'})
  return redirect(url.searchParams.get('redirect') || '/', 307)
}
