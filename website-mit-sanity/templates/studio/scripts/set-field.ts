// Set one field on one document, e.g. to undo a test edit:
//   npx sanity exec scripts/set-field.ts --with-user-token -- home heroTitle.no "Yogarom og hjerterom"
// A value starting with { or [ is parsed as JSON:
//   npx sanity exec scripts/set-field.ts --with-user-token -- settings classesLead '{"_type":"localeText","no":"…","en":"…"}'
import {getCliClient} from 'sanity/cli'

const [id, path, raw] = process.argv.slice(-3)
const value = /^[[{]/.test(raw) ? JSON.parse(raw) : raw
const client = getCliClient({apiVersion: '2026-11-01'})
const res = await client.patch(id).set({[path]: value}).commit()
console.log(`${res._id}: ${path} gesetzt`)
