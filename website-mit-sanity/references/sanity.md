# Sanity einrichten

Stand November 2026, Sanity CLI 6.x. Alle Befehle laufen ohne Rückfragen, wenn die Flags stimmen. Interaktive Befehle immer mit `< /dev/null` starten, dann bricht ein unerwarteter Prompt ab, statt hängen zu bleiben.

## 1. Login (macht der Nutzer)

```bash
npx sanity@latest login
```

Öffnet den Browser, Anmeldung mit Google, GitHub oder E-Mail. Prüfen, ob es geklappt hat:

```bash
npx sanity@latest projects list
```

## 2. Organisation pro Kunde

Ein eigenes Projekt in einer eigenen Organisation pro Kunde. So sehen Teamkollegen aus der eigenen Firma nichts davon, und bei der Übergabe wechselt die ganze Organisation den Besitzer. Kostet nichts.

```bash
npx sanity organizations list
npx sanity organizations create --name "<Kunde>"      # zeigt die ID, z. B. ab1cd2ef3
```

Wenn der Nutzer das Projekt lieber in eine bestehende Organisation legen will, dessen ID nehmen. Frag, statt es zu raten.

## 3. Projekt, Datensatz und Studio

Im Projektstamm:

```bash
npx -y sanity@latest init -y \
  --project-name "<Kunde>" --organization <org-id> \
  --dataset-default --output-path studio \
  --template clean --typescript \
  --no-git --no-mcp --no-skills --no-import-dataset \
  --package-manager npm --install < /dev/null
```

`--dataset-default` legt den öffentlichen Datensatz `production` an. Öffentlich heißt: Veröffentlichte Inhalte darf jeder lesen, Entwürfe nicht. Für eine Webseite ist das richtig. Die Projekt-ID steht danach in `studio/sanity.config.ts`. Sie in `src/lib/sanity-project.ts` eintragen.

## 4. Schema, Menü, Sprache

Aus `$SK/templates/studio/` übernehmen: `sanity.config.ts`, `structure.ts`, `presentation.ts`, `schemaTypes/` (die erzeugten `schemaTypes/` vorher löschen). Dann:

- `schemaTypes/locale.ts`: Sprachen und ihre Namen im Studio. Die IDs müssen zu `LOCALES` in `content.ts` passen.
- Eigene Typen nach dem Muster in `schemaTypes/example.ts`. Felder so beschriften, wie der Kunde denkt, mit kurzen Hinweisen unter Feldern, wo er sonst rätseln würde („Genau drei Fotos.“, „Höchstens 20 Wörter.“).
- Feste Dokumente (Startseite, Einstellungen, feste Unterseiten) in `structure.ts` als Einzeldokumente mit fester ID. `FIXED_IDS` und `FIXED_TYPES` sorgen dafür, dass der Kunde sie nicht löschen oder verdoppeln kann.
- Für die Sprache der Studio-Oberfläche das passende Paket installieren und in `sanity.config.ts` eintragen, z. B. `npm i @sanity/locale-de-de` mit `deDELocale()`, für Norwegisch `@sanity/locale-nb-no` mit `nbNOLocale()`. Feldnamen im Schema in derselben Sprache schreiben. Frag im Interview, in welcher Sprache der Kunde das Studio sehen soll. Das ist oft nicht die Sprache der Webseite.

Prüfen:

```bash
cd studio && npx sanity schemas validate
```

Muss `0 errors` melden.

## 5. Startinhalte importieren

```bash
node cms/seed/build.mjs
cd studio && npx sanity datasets import ../cms/seed/seed.ndjson -d production --replace < /dev/null
```

Fotos aus `gen/src/` werden dabei hochgeladen. `--replace` überschreibt Dokumente mit gleicher ID, also nur am Anfang benutzen oder wenn der Nutzer es ausdrücklich will.

Danach in `src/lib/sanity-project.ts` die Projekt-ID eintragen, Dev-Server neu starten und prüfen, dass Bilder von `cdn.sanity.io` kommen.

## 6. Lese-Token für die Vorschau

Der Vorschau-Modus braucht einen Token, der Entwürfe lesen darf. So anlegen, dass er direkt in `.env` landet und nie im Chat erscheint:

```bash
cd studio && npx sanity tokens add "Website-Vorschau (Entwürfe lesen)" --role viewer --json -y < /dev/null 2>/dev/null \
 | python3 -c "import json,sys; r=sys.stdin.read(); d=json.loads(r[r.find('{'):]); open('../.env','w').write('SANITY_API_READ_TOKEN='+(d.get('key') or d['token'])+'\n'); print('Token in .env')"
cd .. && git check-ignore -q .env && echo ".env ist ignoriert"
npx sanity cors add http://localhost:4321 --credentials -y   # aus studio/ heraus, Port der Seite
```

Den Wert nie ausgeben, nie committen.

## 7. Studio online stellen

In `studio/sanity.cli.ts` eine Adresse festlegen:

```ts
export default defineCliConfig({
  studioHost: '<kunde>',          // ergibt https://<kunde>.sanity.studio
  api: {projectId: '…', dataset: 'production'},
  deployment: {autoUpdates: true},
})
```

```bash
cd studio && npx sanity deploy -y < /dev/null
```

Der erste Deploy nennt eine `appId`. Die unter `deployment.appId` eintragen, sonst fragt jeder weitere Deploy nach. Das Online-Studio verlangt einen Sanity-Login. Ansehen kann es also nur, wer eingeloggt ist. Das ehrlich sagen statt „geprüft“ zu melden.

## Hilfsskript: einzelnes Feld setzen

`$SK/templates/studio/scripts/set-field.ts` nach `studio/scripts/`. Damit lassen sich Testtexte zurücksetzen oder neue Felder befüllen, ohne das Studio zu öffnen:

```bash
cd studio
npx sanity exec scripts/set-field.ts --with-user-token -- home heroTitle.de "Neue Überschrift"
npx sanity exec scripts/set-field.ts --with-user-token -- settings intro '{"_type":"localeText","de":"…","en":"…"}'
```

Was im Datensatz steht, ohne Studio:

```bash
npx sanity documents query '*[_id in path("drafts.**")]{_id}' --api-version 2026-11-01   # offene Entwürfe
npx sanity documents query '*[_id=="home"][0]{heroTitle}' --api-version 2026-11-01
```

Nach jedem Test des Nutzers im Studio nachsehen, ob ein Testtext veröffentlicht wurde, und ihn zurücksetzen.

## Neue Felder später

1. Feld im Schema ergänzen, `npx sanity schemas validate`.
2. In `content.mjs` den Startwert ergänzen (für die nächste Seite aus der Vorlage).
3. Im bestehenden Datensatz mit `set-field.ts` befüllen.
4. Template anpassen, `npx sanity deploy -y`, damit das Online-Studio das Feld zeigt.
