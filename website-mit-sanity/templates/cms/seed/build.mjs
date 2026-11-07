// Turns content.mjs into
//   seed.ndjson  for `sanity dataset import` (photos are uploaded from gen/src)
//   seed.json    for local development before a Sanity project exists
import {writeFileSync, existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'
import {documents} from './content.mjs' // copy content.example.mjs to content.mjs

const here = dirname(fileURLToPath(import.meta.url))
const photos = resolve(here, '../../gen/src')

const missing = []
const toImport = (v) => {
  if (Array.isArray(v)) return v.map((x, i) => {
    const out = toImport(x)
    if (out && typeof out === 'object' && !out._key) out._key = `a${i}`
    return out
  })
  if (v && typeof v === 'object') {
    if (v._file) {
      const abs = resolve(photos, v._file)
      if (!existsSync(abs)) missing.push(v._file)
      const {_file, ...rest} = v
      return {...rest, _sanityAsset: `image@file://${abs}`}
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toImport(x)]))
  }
  return v
}

const docs = documents.map(toImport)
if (missing.length) {
  console.error('Fehlende Fotos:', missing)
  process.exit(1)
}
writeFileSync(resolve(here, 'seed.ndjson'), docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
writeFileSync(resolve(here, 'seed.json'), JSON.stringify(documents, null, 1))
console.log(`${docs.length} Dokumente geschrieben`)
