import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {deDELocale} from '@sanity/locale-de-de' // Studio UI language; e.g. @sanity/locale-nb-no for Norwegian
import {schemaTypes} from './schemaTypes'
import {structure, FIXED_IDS, FIXED_TYPES} from './structure'
import {presentation} from './presentation'

export default defineConfig({
  name: 'default',
  title: '<Kunde>',

  projectId: '<projectId>', // from `sanity init`, same as src/lib/sanity-project.ts
  dataset: 'production',

  plugins: [structureTool({structure}), presentationTool(presentation), deDELocale(), visionTool()],

  schema: {
    types: schemaTypes,
    // No "create new" for fixed documents (start page, settings, fixed sub-pages).
    templates: (templates) => templates.filter(({schemaType}) => !FIXED_TYPES.has(schemaType)),
  },

  document: {
    // Fixed documents can be edited and published, never duplicated or deleted.
    actions: (actions, {documentId}) =>
      FIXED_IDS.has((documentId ?? '').replace(/^drafts\./, ''))
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
    newDocumentOptions: (prev) => prev.filter((item) => !FIXED_TYPES.has(item.templateId)),
  },
})
