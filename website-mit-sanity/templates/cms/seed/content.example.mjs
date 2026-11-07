// Start content for Sanity: write it here in all languages, then
//   node cms/seed/build.mjs       → seed.ndjson (for `sanity datasets import`) and seed.json (site without Sanity)
// Photos: put originals in gen/src/ and reference them with IMG('file.jpg', …).
// Adapt LANGS (same ids as LOCALES in src/lib/content.ts). Two languages: S('Deutsch', 'English').

const LANGS = ['de', 'en']
const pack = (type, values) => Object.fromEntries([['_type', type], ...LANGS.map((l, i) => [l, values[i]])])
const S = (...v) => pack('localeString', v)
const T = (...v) => pack('localeText', v)
const B = (...v) => ({_type: 'localeBlock', ...Object.fromEntries(LANGS.map((l, i) => [l, md(v[i])]))})
const IMG = (file, ...alt) => ({_type: 'photo', _file: file, alt: S(...alt)})

// Mini markdown → Portable Text: blank line = new paragraph, "### " = subheading,
// "- " = bullet, **bold**, *italic*, [text](url).
let k = 0
const key = () => `k${(k++).toString(36)}`
function spans(text) {
  const out = []
  const markDefs = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({_type: 'span', _key: key(), text: text.slice(last, m.index), marks: []})
    const t = m[0]
    if (t.startsWith('**')) out.push({_type: 'span', _key: key(), text: t.slice(2, -2), marks: ['strong']})
    else if (t.startsWith('*')) out.push({_type: 'span', _key: key(), text: t.slice(1, -1), marks: ['em']})
    else {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const mk = key()
      markDefs.push({_type: 'link', _key: mk, href})
      out.push({_type: 'span', _key: key(), text: label, marks: [mk]})
    }
    last = m.index + t.length
  }
  if (last < text.length) out.push({_type: 'span', _key: key(), text: text.slice(last), marks: []})
  return {children: out, markDefs}
}
function md(src) {
  if (!src) return undefined
  const blocks = []
  for (const para of src.trim().split(/\n\s*\n/)) {
    const lines = para.split('\n')
    if (lines.every((l) => l.startsWith('- '))) {
      for (const l of lines) blocks.push({_type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, ...spans(l.slice(2))})
    } else if (para.startsWith('### ')) {
      blocks.push({_type: 'block', _key: key(), style: 'h3', ...spans(para.slice(4))})
    } else {
      blocks.push({_type: 'block', _key: key(), style: 'normal', ...spans(lines.join(' '))})
    }
  }
  return blocks
}

export const documents = [
  {
    _id: 'settings', _type: 'settings',
    name: 'Beispiel GmbH',
    street: 'Hauptstraße 1', postal: '12345 Musterstadt',
    phone: '+49 123 456789', email: 'hallo@example.com',
    seoTitle: S('Beispiel GmbH · Musterstadt', 'Example Ltd · Musterstadt'),
    seoDescription: T('Ein Satz, wer ihr seid und was ihr macht.', 'One sentence on who you are and what you do.'),
  },
  {
    _id: 'home', _type: 'home',
    heroTitle: S('Überschrift der Startseite', 'Home page headline'),
    heroLead: T('Eine Unterzeile mit höchstens zwanzig Wörtern.', 'A subline with twenty words at most.'),
    introTitle: S('Über uns', 'About us'),
    introBody: B(
      `Erster Absatz mit **fettem** Wort und einem [Link](https://example.com).

- Aufzählung eins
- Aufzählung zwei`,
      `First paragraph with a **bold** word and a [link](https://example.com).

- List item one
- List item two`,
    ),
    introPhotos: [
      IMG('foto-1.jpg', 'Was auf Foto 1 zu sehen ist', 'What photo 1 shows'),
      IMG('foto-2.jpg', 'Was auf Foto 2 zu sehen ist', 'What photo 2 shows'),
      IMG('foto-3.jpg', 'Was auf Foto 3 zu sehen ist', 'What photo 3 shows'),
    ],
  },
  {
    _id: 'service-beratung', _type: 'service', order: 10,
    title: S('Beratung', 'Consulting'),
    slug: {_type: 'slug', current: 'beratung'},
    summary: T('Ein bis zwei Sätze.', 'One or two sentences.'),
    body: B('Ausführlicher Text.\n\n### Zwischenüberschrift\nWeiterer Absatz.', 'Full text.\n\n### Subheading\nAnother paragraph.'),
    price: 90,
    photo: IMG('foto-1.jpg', 'Beschreibung', 'Description'),
  },
  {
    _id: 'post-start', _type: 'post',
    title: S('Unsere neue Webseite', 'Our new website'),
    slug: {_type: 'slug', current: 'neue-webseite'},
    date: '2026-01-01',
    body: B('Kurzer Text.', 'Short text.'),
  },
  {_id: 'page-about', _type: 'page', title: S('Über uns', 'About us'), lead: T('Einleitung.', 'Introduction.'), body: B('Text.', 'Text.')},
  {_id: 'page-contact', _type: 'page', title: S('Kontakt', 'Contact'), body: B('Text.', 'Text.')},
]
