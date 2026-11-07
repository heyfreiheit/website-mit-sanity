import {defineType, defineField} from 'sanity'

// Rules that keep the site maintainable:
// - every visible text is localeString / localeText / localeBlock (one field per language)
// - every photo is `photo` (hotspot + alt text per language)
// - layout, order of sections and design assets stay in code, not here
// - fixed documents (home, settings, sub-pages) are singletons, see structure.ts

export const settings = defineType({
  name: 'settings', title: 'Kontakt und Einstellungen', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'street', title: 'Straße', type: 'string'}),
    defineField({name: 'postal', title: 'PLZ und Ort', type: 'string'}),
    defineField({name: 'phone', title: 'Telefon', type: 'string'}),
    defineField({name: 'email', title: 'E-Mail', type: 'string'}),
    defineField({name: 'instagram', title: 'Instagram', type: 'url'}),
    defineField({name: 'seoTitle', title: 'Titel bei Google', type: 'localeString'}),
    defineField({name: 'seoDescription', title: 'Beschreibung bei Google', description: 'Etwa 150 Zeichen.', type: 'localeText'}),
  ],
  preview: {prepare: () => ({title: 'Kontakt und Einstellungen'})},
})

export const home = defineType({
  name: 'home', title: 'Startseite', type: 'document',
  groups: [{name: 'hero', title: 'Oben', default: true}, {name: 'intro', title: 'Über uns'}],
  fields: [
    defineField({name: 'heroTitle', title: 'Überschrift', type: 'localeString', group: 'hero'}),
    defineField({name: 'heroLead', title: 'Unterzeile', description: 'Höchstens 20 Wörter.', type: 'localeText', group: 'hero'}),
    defineField({name: 'introTitle', title: 'Überschrift', type: 'localeString', group: 'intro'}),
    defineField({name: 'introBody', title: 'Text', type: 'localeBlock', group: 'intro'}),
    defineField({name: 'introPhotos', title: 'Fotos', description: 'Genau drei Fotos.', type: 'array', of: [{type: 'photo'}], group: 'intro', validation: (r) => r.min(3).max(3)}),
  ],
  preview: {prepare: () => ({title: 'Startseite'})},
})

export const page = defineType({
  name: 'page', title: 'Seite', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Überschrift', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'lead', title: 'Einleitung', type: 'localeText'}),
    defineField({name: 'body', title: 'Text', type: 'localeBlock'}),
    defineField({name: 'photos', title: 'Fotos', type: 'array', of: [{type: 'photo'}]}),
  ],
  preview: {select: {title: 'title.de'}},
})

export const service = defineType({
  name: 'service', title: 'Leistung', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Name', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Adresse (URL)', type: 'slug', options: {source: 'title.de'}, validation: (r) => r.required()}),
    defineField({name: 'summary', title: 'Kurzbeschreibung', type: 'localeText'}),
    defineField({name: 'body', title: 'Ausführliche Beschreibung', type: 'localeBlock'}),
    defineField({name: 'price', title: 'Preis in Euro', type: 'number'}),
    defineField({name: 'photo', title: 'Foto', type: 'photo'}),
    defineField({name: 'order', title: 'Reihenfolge', description: 'Kleine Zahl zuerst.', type: 'number'}),
  ],
  orderings: [{title: 'Reihenfolge', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title.de', media: 'photo'}},
})

export const post = defineType({
  name: 'post', title: 'Neuigkeit', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Überschrift', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Adresse (URL)', type: 'slug', options: {source: 'title.de'}, validation: (r) => r.required()}),
    defineField({name: 'date', title: 'Datum', type: 'date', validation: (r) => r.required()}),
    defineField({name: 'body', title: 'Text', type: 'localeBlock'}),
    defineField({name: 'photo', title: 'Foto', type: 'photo'}),
  ],
  orderings: [{title: 'Neueste zuerst', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {select: {title: 'title.de', subtitle: 'date', media: 'photo'}},
})
