# Architektur: so wird die Seite Sanity-fähig

Die Seite ist ein Astro-Projekt, das als kleiner Node-Server läuft. Jeder Aufruf lädt die Inhalte aus Sanity. Das hat drei Folgen, die den ganzen Aufbau bestimmen:

- Eine Veröffentlichung im Studio ist nach höchstens zehn Sekunden online. Es gibt keinen Neubau, keinen Webhook und keine GitHub Action für Inhalte. Dafür liest `content.ts` die direkte Sanity-API mit einem eigenen Zehn-Sekunden-Zwischenspeicher. Das Sanity-API-CDN (`useCdn: true`) lieferte im Test Änderungen rund eine Minute zu spät.
- Das Studio kann die echte Seite im Reiter „Presentation“ anzeigen, mit Entwürfen und anklickbaren Feldern (siehe `visual-editing.md`).
- Der Hoster muss Node.js können. Bei Hostinger heißt das Web Unlimited oder Cloud (siehe `hostinger.md`).

## Projekt anlegen

```bash
npm create astro@latest <name> -- --template minimal --no-install --no-git --skip-houston -y
cd <name> && npm install
npm i @astrojs/node @sanity/client @sanity/image-url @sanity/visual-editing @sanity/preview-url-secret @portabletext/to-html
```

`create astro` legt einen Unterordner an. Liegen dort schon Projektdateien (Brief, Fotos), Inhalt samt versteckter Dateien (`.gitignore`, `.vscode`) eine Ebene hochziehen.

Dann aus `$SK/templates/` übernehmen:

| Vorlage | Ziel | Anpassen |
|---|---|---|
| `astro.config.mjs` | Projektstamm | `site`, Port |
| `src/lib/sanity-project.ts` | gleich | Projekt-ID nach Phase 3, Studio-Adresse |
| `src/lib/content.ts` | gleich | `LOCALES`, `DEFAULT_LOCALE`, `DOC_TYPES`, Getter unten |
| `src/lib/request-context.ts` | gleich | nichts |
| `src/middleware.ts`, `src/env.d.ts` | gleich | nichts |
| `src/pages/api/draft-mode/*.ts` | gleich | nichts |
| `src/components/VisualEditing.astro` | gleich | nichts, im Layout vor `</body>` einbinden |
| `cms/seed/build.mjs`, `content.example.mjs` | gleich | `content.example.mjs` in `content.mjs` umbenennen, Inhalte eintragen |

`package.json`:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "start": "HOST=${HOST:-0.0.0.0} node ./dist/server/entry.mjs"
}
```

`.gitignore` ergänzen: `.env`, `gen/`, `lab/`, `studio/dist/`, `studio/.sanity/`.

## Regeln

1. **Genau eine Ladedatei.** Seiten holen Inhalte nur über `src/lib/content.ts`. Nie direkt einen Sanity-Client in einer Seite.
2. **Jeder sichtbare Text ist zweisprachig** (oder einsprachig, aber immer aus Sanity): `{de: '…', en: '…'}`, im Template über `t(feld, locale)`. Fehlt eine Übersetzung, springt `t()` auf die Hauptsprache.
3. **Formatierter Text** über `rich(feld, locale)`. Zwischenüberschriften im Studio („h3“) werden als `<h2>` ausgegeben, damit nach dem `<h1>` keine Ebene fehlt.
4. **Fotos** über `picture(foto, locale, {ratio, max})`. Das liefert `src`, `srcset` und `alt` aus dem Sanity-Bild-CDN und schneidet um den Fokuspunkt, den der Kunde im Studio setzt.
5. **Fest im Code bleibt**, was zur Gestaltung gehört: Layout, Reihenfolge der Abschnitte, Farben, Schriften, freigestellte Hero-Ebenen, Animationen. Das kommt nach `public/` und nie ins CMS.
6. **Oberflächen-Wörter** (Navigation, „Mehr erfahren“, Wochentage) dürfen in einer kleinen Datei `src/lib/i18n.ts` stehen, zusammen mit den Adressen der Unterseiten je Sprache. Alles, was der Kunde schreibt oder ändern will, gehört nach Sanity. Einleitungstexte von Unterseiten vergisst man leicht.
7. **Werte, mit denen der Code rechnet** (Wochentag-Schlüssel, Datum, Auswahlwerte), sind keine übersetzten Felder. Sonst bekommen sie im Vorschau-Modus unsichtbare Markierungen und Vergleiche schlagen fehl. Ist doch einmal ein markierter Text im Spiel, vorher `clean(wert)`.

## Routen bei Server-Betrieb

Im Server-Modus gibt es kein `getStaticPaths`. Jede Seite löst ihre Adresse selbst auf und gibt bei Unbekanntem 404 zurück:

```astro
---
import {LOCALES, type Locale, getServices} from '../../lib/content';
const locale = Astro.params.lang as Locale;
if (!LOCALES.includes(locale)) return new Response(null, {status: 404});
const doc = (await getServices()).find((d) => d.slug?.current === Astro.params.slug);
if (!doc) return new Response(null, {status: 404});
---
```

Dazu eine `src/pages/404.astro`. Die Startseite `/` leitet nach `Accept-Language` weiter:

```astro
---
const accept = (Astro.request.headers.get('accept-language') ?? '').toLowerCase();
return Astro.redirect(/\bde\b/.test(accept) ? '/de/' : '/en/', 302);
---
```

Jede Sprachversion bekommt `hreflang`-Links auf die andere.

## Erst Inhalte, dann Sanity

Die Seite muss laufen, bevor es das Sanity-Projekt gibt. Deshalb kommen alle Inhalte zuerst nach `cms/seed/content.mjs`: echte Texte in allen Sprachen, Fotos als `IMG('datei.jpg', alt…)` aus `gen/src/`. `node cms/seed/build.mjs` schreibt daraus

- `seed.json`: Damit läuft die Seite, solange in `sanity-project.ts` keine Projekt-ID steht. Fotos kommen dann im Dev-Server über `/@fs/` direkt aus `gen/src/`.
- `seed.ndjson`: Importdatei für Sanity in Phase 3. Fotos werden dabei automatisch hochgeladen (`_sanityAsset`).

So kann die Gestaltung in Ruhe entstehen, und der Kunde bekommt später ein volles Studio statt leerer Formulare.

## Bilder für die Gestaltung

Generierte Bilder (Hero-Ebenen, Stimmungsbilder) erstellt der Design-Skill. Echte Personen des Kunden nie per KI nachbauen. Fürs Generieren mit der Codex-CLI: `codex exec … < /dev/null`, sonst wartet der Befehl ewig auf Eingabe. Zum Freistellen aus einer Fläche in `#00FF00` ein Chroma-Key mit Alpha und Entfärbung des grünen Saums, danach die Kanten auf rotem und dunklem Grund ansehen.

## Fallen beim Gestalten (aus dem Testprojekt)

- Beim Ebenen-Hero brauchen eine Person und der Boden, auf dem sie sitzt oder steht dieselbe Bewegung (gleicher `transform` und `transform-origin`). Sonst hebt die Person beim Scrollen ab. Tiefe entsteht über Hintergrund und Schrift, die sich anders bewegen.
- Scrollcraft schreibt `--sc-p` direkt ans Element. Ein Standbild bei reduzierter Bewegung braucht deshalb `--sc-p: 0 !important`.
- Ein Abschnitt, der hart von hell auf dunkel wechselt, braucht einen eigenen Hintergrund. Sonst steht während des Farbübergangs dunkler Text auf noch dunklem Grund.
- Bewegte Lichteffekte nur über `transform` verschieben, nie über `left`/`top`.

## Vor Phase 3 prüfen

- `npm run build` läuft fehlerfrei, `npm start` liefert die Seite aus.
- `grep -rn "createClient" src/pages` findet nichts.
- Jeder sichtbare Text kommt aus `content.mjs` (Stichprobe: Wert ändern, `node cms/seed/build.mjs`, Seite neu laden).
