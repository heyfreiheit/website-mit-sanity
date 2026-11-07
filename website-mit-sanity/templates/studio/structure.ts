import type {StructureResolver} from 'sanity/structure'

// The menu the client sees. Fixed documents open directly, collections are lists.
// Adapt titles, ids and types to the project.
const fixed = (S: Parameters<StructureResolver>[0], title: string, type: string, id: string) =>
  S.listItem().title(title).id(id).child(S.document().schemaType(type).documentId(id))

export const FIXED_IDS = new Set(['home', 'settings', 'page-about', 'page-contact'])
export const FIXED_TYPES = new Set(['home', 'settings', 'page'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('<Kunde>')
    .items([
      fixed(S, 'Startseite', 'home', 'home'),
      S.divider(),
      S.documentTypeListItem('service').title('Leistungen'),
      S.documentTypeListItem('post').title('Neuigkeiten'),
      S.divider(),
      fixed(S, 'Über uns', 'page', 'page-about'),
      fixed(S, 'Kontakt', 'page', 'page-contact'),
      S.divider(),
      fixed(S, 'Kontakt und Einstellungen', 'settings', 'settings'),
    ])
