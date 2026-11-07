// The only place that loads content. Pages import from here, never from Sanity
// or the seed file directly.
//
// Visitors get published documents (direct Sanity API, cached here for ten seconds).
// Draft mode (Studio → Presentation) gets drafts with invisible edit markers
// ("stega") on every translatable text, so the overlays know which field it is.
// Without a project id the site runs on cms/seed/seed.json.
//
// Adapt: LOCALES, DEFAULT_LOCALE, DOC_TYPES and the getters at the bottom.
import {createClient, type SanityClient} from '@sanity/client'
import {stegaClean} from '@sanity/client/stega'
import {createImageUrlBuilder} from '@sanity/image-url'
import {createDataAttribute} from '@sanity/visual-editing/create-data-attribute'
import {toHTML} from '@portabletext/to-html'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {SANITY_PROJECT} from './sanity-project'
import {isDraft} from './request-context'

export const LOCALES = ['de', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'de'

/** Every document type the site renders. */
const DOC_TYPES = ['settings', 'home', 'page', 'service', 'post']

// An env variable wins over the file, e.g. PUBLIC_SANITY_PROJECT_ID= (empty) for seed mode.
const envId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined
const projectId = envId !== undefined ? envId : SANITY_PROJECT.projectId
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string | undefined) || SANITY_PROJECT.dataset
// Read at runtime: hosts like Hostinger set environment variables when the app starts,
// not while it is built, and the token never ends up in the build. The dev server reads .env.
const token = (import.meta.env.DEV ? import.meta.env.SANITY_API_READ_TOKEN : process.env.SANITY_API_READ_TOKEN) as string | undefined
export const STUDIO_URL = (import.meta.env.PUBLIC_SANITY_STUDIO_URL as string | undefined) || SANITY_PROJECT.studioUrl

export const usingSanity = Boolean(projectId)
const API_VERSION = '2026-11-01'
const isLocaleKey = (seg: unknown) => (LOCALES as readonly unknown[]).includes(seg)

const publishedClient = projectId
  ? // Direct API, not the API CDN: the CDN serves a publish up to a minute late.
    // The small cache below keeps the number of requests low anyway.
    createClient({projectId, dataset, apiVersion: API_VERSION, useCdn: false, perspective: 'published'})
  : null

/** Reads drafts. Only exists when a read token is configured. */
export const draftClient: SanityClient | null =
  projectId && token
    ? createClient({
        projectId, dataset, apiVersion: API_VERSION, useCdn: false, token, perspective: 'drafts',
        stega: {
          enabled: true,
          studioUrl: STUDIO_URL,
          // Mark only texts the client writes (the per-language fields and the span
          // text inside rich text). Never ids, slugs, dates, emails, option values,
          // styles or link targets: the code compares and links with those.
          filter: ({sourcePath}) => {
            const last = sourcePath[sourcePath.length - 1]
            if (isLocaleKey(last)) return true
            return last === 'text' && sourcePath.some(isLocaleKey)
          },
        },
      })
    : null

const builder = publishedClient ? createImageUrlBuilder(publishedClient) : null

type Doc = Record<string, any>
const QUERY = `*[_type in ${JSON.stringify(DOC_TYPES)}]`
const CACHE_MS = 10_000
let cache: {at: number; docs: Promise<Doc[]>} | null = null

function load(): Promise<Doc[]> {
  if (!publishedClient) return Promise.resolve(JSON.parse(readFileSync(resolve('cms/seed/seed.json'), 'utf8')))
  if (isDraft() && draftClient) return draftClient.fetch(QUERY)
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    const docs = publishedClient.fetch(QUERY)
    cache = {at: Date.now(), docs}
    docs.catch(() => { cache = null })
  }
  return cache.docs
}

/** Remove edit markers from a value the code compares or calculates with. */
export const clean = <T>(v: T): T => stegaClean(v)

/** data-sanity attribute for elements without text (photos, numbers, lists) in draft mode.
 *  Path examples: 'photo', 'gallery[_key=="a1b2"]', 'groups[_key=="g1"].items[_key=="i1"].amount' */
export function editable(doc: Doc, path: string): string | undefined {
  if (!isDraft() || !doc?._id) return undefined
  return createDataAttribute({baseUrl: STUDIO_URL, projectId, dataset, id: doc._id, type: doc._type, path}).toString()
}

// ── Text ──────────────────────────────────────────────────────────────────
/** Pick one language from a {de, en} field. Empty translations fall back to DEFAULT_LOCALE. */
export function t(field: any, locale: Locale): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[locale] || field[DEFAULT_LOCALE] || ''
}

/** Rich text {de: blocks, en: blocks} → HTML. Subheadings ("h3" in the Studio) render
 *  as <h2>, so a page with one <h1> never skips a heading level. */
export function rich(field: any, locale: Locale): string {
  const blocks = field?.[locale]?.length ? field[locale] : field?.[DEFAULT_LOCALE]
  if (!blocks?.length) return ''
  return toHTML(blocks, {
    components: {
      block: {h3: ({children}) => `<h2>${children}</h2>`},
      marks: {
        link: ({children, value}) => {
          const href = String(value?.href ?? '')
          const external = /^https?:/.test(href)
          return `<a href="${href}"${external ? ' rel="noopener" target="_blank"' : ''}>${children}</a>`
        },
      },
    },
  })
}

// ── Images ────────────────────────────────────────────────────────────────
export type Picture = {src: string; srcset: string; alt: string; width: number; height: number}
const WIDTHS = [480, 800, 1200, 1800]

/** A responsive picture for any photo field. `ratio` (w/h) crops around the hotspot. */
export function picture(photo: any, locale: Locale, opts: {ratio?: number; max?: number} = {}): Picture | null {
  if (!photo) return null
  const alt = t(photo.alt, locale)
  const max = opts.max ?? 1800
  if (photo._file || !builder) {
    // Seed mode, dev only: Vite serves project files through /@fs/.
    return {src: `/@fs${resolve('gen/src', photo._file)}`, srcset: '', alt, width: max, height: Math.round(max / (opts.ratio ?? 1.5))}
  }
  const widths = WIDTHS.filter((w) => w <= max)
  const url = (w: number) => {
    let b = builder!.image(photo).width(w).auto('format').quality(78)
    if (opts.ratio) b = b.height(Math.round(w / opts.ratio)).fit('crop')
    return b.url()
  }
  const dims = photo.asset?._ref?.match(/-(\d+)x(\d+)-/)
  const ratio = opts.ratio ?? (dims ? Number(dims[1]) / Number(dims[2]) : 1.5)
  return {
    src: url(widths[widths.length - 1] ?? max),
    srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width: max,
    height: Math.round(max / ratio),
  }
}

// ── Documents (adapt) ────────────────────────────────────────────────────
const byId = async (id: string) => (await load()).find((d) => d._id === id) ?? {}
const byType = async (type: string) => (await load()).filter((d) => d._type === type)

export const getSettings = () => byId('settings')
export const getHome = () => byId('home')
export const getPage = (key: string) => byId(`page-${key}`)

export async function getServices() {
  return (await byType('service')).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
}

export async function getPosts() {
  return (await byType('post')).sort((a, b) => String(b.date).localeCompare(String(a.date)))
}
