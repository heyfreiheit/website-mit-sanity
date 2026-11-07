import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

// Where the website runs. The Studio shows it in the "Presentation" tab and switches
// on draft mode there. Local Studio → local site; deployed Studio → live site.
// Set LIVE_URL once the site is online, then `sanity cors add <LIVE_URL> --credentials`
// and `sanity deploy`.
const LOCAL_URL = 'http://localhost:4321'
const LIVE_URL = 'http://localhost:4321'

const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'
const ORIGIN = isLocal ? LOCAL_URL : LIVE_URL

const both = (title: string, de: string, en: string) => [
  {title: `${title} (DE)`, href: de},
  {title: `${title} (EN)`, href: en},
]

export const presentation: PresentationPluginOptions = {
  previewUrl: {
    initial: `${ORIGIN}/de/`,
    previewMode: {enable: '/api/draft-mode/enable/', disable: '/api/draft-mode/disable/'},
  },
  allowOrigins: [LOCAL_URL, LIVE_URL],
  resolve: {
    // Which document opens next to a page. Adapt routes to src/lib/i18n.ts.
    mainDocuments: defineDocuments([
      {route: '/:lang/', filter: `_id == "home"`},
      {route: '/de/leistungen/:slug/', filter: `_type == "service" && slug.current == $slug`},
      {route: '/en/services/:slug/', filter: `_type == "service" && slug.current == $slug`},
    ]),
    // "Used on these pages" on every document.
    locations: {
      home: defineLocations({locations: both('Startseite', '/de/', '/en/')}),
      settings: defineLocations({message: 'Erscheint auf allen Seiten.', locations: both('Startseite', '/de/', '/en/')}),
      service: defineLocations({
        select: {title: 'title.de', slug: 'slug.current'},
        resolve: (doc) => ({locations: both(doc?.title ?? 'Leistung', `/de/leistungen/${doc?.slug}/`, `/en/services/${doc?.slug}/`)}),
      }),
    },
  },
}
