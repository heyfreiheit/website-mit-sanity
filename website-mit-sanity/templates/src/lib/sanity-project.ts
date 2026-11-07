// The Sanity project this site reads from. Not secret: the dataset is public
// and only published documents are readable without a token. Leave projectId
// empty to run the site on cms/seed/seed.json instead (before Sanity exists).
export const SANITY_PROJECT = {
  projectId: '', // e.g. 'ab12cd34' from `sanity init`
  dataset: 'production',
  /** Where "open in Studio" links from the preview overlays point to. */
  studioUrl: 'https://<studio-host>.sanity.studio',
}
