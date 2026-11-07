import {defineType, defineField} from 'sanity'

// Every visible text exists once per language. The first language is the main one;
// an empty translation falls back to it on the site. Adapt LANGUAGES to the project
// (ids must match LOCALES in src/lib/content.ts) and the titles to the language the
// client should see in the Studio.
export const LANGUAGES = [
  {id: 'de', title: 'Deutsch'},
  {id: 'en', title: 'Englisch'},
] as const

const fieldset = {name: 'translations', title: 'Übersetzungen', options: {collapsible: false}}

export const localeString = defineType({
  name: 'localeString',
  title: 'Text (NO/EN)',
  type: 'object',
  fieldsets: [fieldset],
  fields: LANGUAGES.map((l) =>
    defineField({name: l.id, title: l.title, type: 'string', fieldset: 'translations'}),
  ),
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Absatz (NO/EN)',
  type: 'object',
  fieldsets: [fieldset],
  fields: LANGUAGES.map((l) =>
    defineField({name: l.id, title: l.title, type: 'text', rows: 4, fieldset: 'translations'}),
  ),
})

const block = {
  type: 'block',
  styles: [
    {title: 'Absatz', value: 'normal'},
    {title: 'Zwischenüberschrift', value: 'h3'},
  ],
  lists: [{title: 'Aufzählung', value: 'bullet'}],
  marks: {
    decorators: [
      {title: 'Fett', value: 'strong'},
      {title: 'Kursiv', value: 'em'},
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [{name: 'href', type: 'url', title: 'Adresse', validation: (r: any) => r.uri({scheme: ['http', 'https', 'mailto', 'tel']})}],
      },
    ],
  },
}

export const localeBlock = defineType({
  name: 'localeBlock',
  title: 'Text mit Formatierung (NO/EN)',
  type: 'object',
  fieldsets: [fieldset],
  fields: LANGUAGES.map((l) =>
    defineField({name: l.id, title: l.title, type: 'array', of: [block], fieldset: 'translations'}),
  ),
})

export const photo = defineType({
  name: 'photo',
  title: 'Foto',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Bildbeschreibung',
      description: 'Kurz, was auf dem Foto zu sehen ist. Hilft Google und Menschen, die das Bild nicht sehen.',
      type: 'localeString',
    }),
  ],
})
