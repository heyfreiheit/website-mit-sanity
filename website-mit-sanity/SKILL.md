---
name: website-mit-sanity
description: Kompletter Weg von der Idee zur übergabefertigen Kundenwebseite mit Sanity als Redaktionssystem. Baut eine hochwertige, auf Wunsch mehrsprachige Webseite mit Scrollcraft (scroll-animierte Erlebnisseite) und/oder Impeccable (Design-Prüfung und Feinschliff), legt alle Texte und Fotos in Sanity an, richtet das Sanity Studio in der Sprache des Kunden ein, baut Visual Editing ein (Seite im Studio anklicken und direkt bearbeiten), stellt den Code in ein privates GitHub-Repo und veröffentlicht als eine einzige Node.js-Web-App bei Hostinger. Verwenden, wenn jemand eine Webseite mit Sanity bauen, eine bestehende Seite mit Sanity neu aufsetzen, ein „Headless CMS“, „Backend für den Kunden“, „Visual Editing“, „Presentation Tool“ oder „Seite, die der Kunde selbst pflegt“ haben will, oder eine Astro-Seite an Sanity anbinden und bei Hostinger hosten möchte. Auch bei „Webseite mit Sanity“, „Sanity Studio einrichten“, „Kunde soll Texte und Fotos selbst ändern“.
---

# Website mit Sanity: bauen, anbinden, übergeben

Am Ende steht eine Webseite, die gut aussieht, deren Texte und Fotos der Kunde im Sanity Studio selbst ändert und die er sogar direkt in der Seite anklicken kann (Visual Editing). Der Code liegt in einem privaten GitHub-Repo und läuft als **eine** Node.js-Web-App bei Hostinger. Eine Veröffentlichung im Studio ist nach Sekunden online, ohne Neubau.

Skill-Ordner (im Folgenden `$SK`): der Ordner dieser Datei, meist `~/.claude/skills/website-mit-sanity/`.

Arbeite die Phasen der Reihe nach ab. Nach jeder Phase kurz sagen, was steht, und erst weitermachen, wenn der Nutzer einverstanden ist. Wo der Nutzer selbst ran muss (Logins, hPanel), gib ihm genaue Schritte und warte.

## Phase 0: Voraussetzungen

```bash
node -v            # 22 oder neuer
git --version
gh auth status     # GitHub-CLI angemeldet? Sonst: gh auth login (macht der Nutzer)
```

Design-Skills prüfen. Empfohlen ist mindestens einer, am stärksten beide zusammen: Scrollcraft baut, Impeccable prüft und poliert.

| Skill | Stärke | Installation |
|---|---|---|
| **Scrollcraft** (Nate Herk, MIT) | Erlebnisseiten mit Scroll-Animationen, Ebenen-Hero, einem inszenierten Höhepunkt | `/plugin marketplace add nateherkai/scroll-craft`, dann `/plugin install nateherk-design` |
| **Impeccable** (Paul Bakaus, Apache 2.0) | Design-Vokabular, Kritik, technisches Audit, Detektor gegen den KI-Look | im Projektordner `npx impeccable install --project --providers=claude,codex -y` |

Impeccable **projektweise** installieren, nicht global. Es bringt einen Design-Hook mit, der sonst in jedem anderen Projekt mitläuft. Läuft die Sitzung nicht im Projektordner, lädt der Skill nicht automatisch. Dann `.claude/skills/impeccable/SKILL.md` lesen und von Hand abarbeiten.

Fehlt `gh` oder ist es nicht angemeldet, das dem Nutzer sagen. Login-Daten nie selbst eintippen und nie im Chat erfragen.

## Phase 1: Kurz-Interview

In einer Nachricht, nicht als Fragebogen-Marathon:

1. Für wen ist die Seite, und gibt es eine bestehende Seite (URL), deren Inhalte und Fotos wir übernehmen?
2. Welche Sprachen hat die Seite? Welche ist die Hauptsprache?
3. In welcher Sprache soll der Kunde das Studio sehen (Oberfläche und Feldnamen)? Oft eine andere als die der Seite.
4. Was soll der Kunde selbst ändern? (Standard: alle Texte, Fotos, Angebote, Preise, Termine, Kontaktdaten.)
5. Welchen Hostinger-Tarif gibt es? (Für eine Web-App mit Node.js: Web Unlimited oder Cloud, siehe `references/hostinger.md`.)
6. Unter welchem GitHub-Account soll das Repo liegen?

Stil, Stimmung und Aufbau klärt der Design-Skill in seinem eigenen Ablauf. Hier nicht doppelt fragen. Mach Vorschläge statt leerer Fragen, wenn du aus der bestehenden Seite schon viel ableiten kannst.

Inhalte einer bestehenden Seite übernehmen: alle Unterseiten als Text sichern (`firecrawl scrape …` oder `curl` + HTML-zu-Text, bei Rate-Limits auf `curl` ausweichen), alle Fotos in Originalgröße nach `gen/src/` laden, einen Kontaktbogen bauen und die Qualität ehrlich bewerten (kleine Fotos taugen für Karten, nicht für einen Hero). Widersprüche in den alten Inhalten (z. B. zwei verschiedene Preise) benennen und die neueste Angabe nehmen. Nur Inhalte übernehmen, die der Nutzer im Auftrag des Seiteninhabers neu baut.

## Phase 2: Seite bauen

Lies zuerst `$SK/references/architektur.md`. Die Regeln dort gelten zusätzlich zum Design-Skill und gehen bei Widerspruch vor. Kurz:

- Astro als Node-Server (`output: 'server'`), Vorlagen aus `$SK/templates/`.
- Alle Inhalte nur über `src/lib/content.ts`. Jeder sichtbare Text als `{de, en}` (Sprachen anpassen), Fotos als Sanity-Bild mit Bildbeschreibung.
- Erst kommen die Startinhalte, dann Sanity: alle Texte in allen Sprachen nach `cms/seed/content.mjs`. Die Seite läuft damit schon, bevor es ein Sanity-Projekt gibt. Alte Texte nicht 1:1 übernehmen, sondern überarbeiten. Übersetzungen selbst schreiben und als „bitte gegenlesen“ markieren.
- Gestaltungs-Bilder, die zur Animation passen müssen (Hero-Ebenen), bleiben fest im Code.

Mit Scrollcraft dessen Ablauf normal durchgehen (Interview, Brief, Höhepunkt, Assets, Bau, Prüfung mit Screenshots auf Desktop, Handy, reduzierter Bewegung). Seine Engine kommt unverändert nach `public/js/` und `src/styles/`. Die Gestaltungs-Fallen am Ende von `architektur.md` beachten.

Mit Impeccable zuerst `PRODUCT.md` per `init` mit dem Nutzer anlegen (Zielgruppe, Zweck, Barrierefreiheits-Ziel), dann `impeccable detect http://localhost:<port>/…` auf Desktop und Handy (`--viewport 390x844`), Audit nach `reference/audit.md`, Befunde beheben, erneut prüfen. Typische Funde: Akzentfarbe als Textfarbe knapp unter 4,5:1, übersprungene Überschriften-Ebenen, eine Überzeile über Überschriften, Texte fest im Code statt im CMS.

Am Ende muss `npm run build` fehlerfrei laufen und `npm start` die Seite ausliefern.

## Phase 3: Sanity einrichten

Lies `$SK/references/sanity.md`. Ablauf:

1. Nutzer meldet sich an: `npx sanity@latest login`.
2. Eigene Organisation pro Kunde (fragen, ob das passt), Projekt und Studio per `sanity init` ohne Rückfragen.
3. Schema, Menü und Studio-Sprache aus den Vorlagen, `sanity schemas validate`.
4. Startinhalte importieren (`datasets import`, Fotos laden automatisch hoch), Projekt-ID in `src/lib/sanity-project.ts`.
5. Studio lokal starten. Der Nutzer loggt sich ein und ändert testweise einen Text. Danach prüfen, ob ein Testtext veröffentlicht wurde, und ihn mit `set-field.ts` zurücksetzen.
6. Studio online stellen (`studioHost`, `sanity deploy`).

## Phase 4: Visual Editing

Lies `$SK/references/visual-editing.md`. Die Vorlagen (`middleware.ts`, `request-context.ts`, `api/draft-mode/*`, `VisualEditing.astro`, `studio/presentation.ts`) sind schon im Projekt. Jetzt:

1. Lese-Token nach `.env` (so, dass er nie im Chat erscheint), CORS für die lokale Adresse.
2. Fotos, Zahlen und Listen mit `data-sanity={editable(doc, pfad)}` markieren.
3. Per `curl` prüfen: Schalter ohne Geheimnis 401, gefälschtes Cookie zeigt nichts, echter Vorschau-Modus zeigt Markierungen, normale Besucher nicht.
4. Nutzer testet im Studio: Reiter „Presentation“, Text anklicken, ändern. Danach Testtext zurücksetzen.

## Phase 5: Privates GitHub-Repo

```bash
git init -b main
git add -A && git diff --cached | grep -inE "(api[_-]?key|secret|token|password)\s*[:=]|AIza|sk[a-zA-Z0-9]{30,}" || echo "sauber"
git commit -m "…"
gh repo create <account>/<name> --private --source=. --remote=origin --push
gh repo view <account>/<name> --json visibility,url     # muss PRIVATE sein
```

Abgeschriebene Inhalte alter Seiten enthalten manchmal öffentliche Schlüssel (z. B. Google-Maps-Keys im Quelltext). Vor dem ersten Commit schwärzen.

## Phase 6: Hostinger

Lies `$SK/references/hostinger.md`. Der Nutzer legt im hPanel eine Node.js-Web-App aus GitHub an (Entry file `server/entry.mjs`, Umgebungsvariable `SANITY_API_READ_TOKEN` per „Import .env“). Mit der Live-Adresse: `LIVE_URL` in `presentation.ts`, CORS, Studio neu deployen. Abschlusstest: im Online-Studio veröffentlichen und online sehen, Presentation auf der Live-Seite benutzen.

## Phase 7: Übergabe

Arbeite `$SK/references/uebergabe.md` ab: Checkliste, Kunden einladen (`sanity users invite`), auf Wunsch Organisation übergeben, Kurzanleitung für den Kunden.

## Grundsätze

- Ehrlich berichten, was geprüft ist und was nicht. „Baut fehlerfrei“, „per curl geprüft“ und „im Studio getestet“ sind drei verschiedene Dinge. Das Online-Studio und echte Handys kann nur der Nutzer selbst ansehen.
- Nichts im Namen des Nutzers veröffentlichen, bezahlen oder einladen, ohne dass er es ausdrücklich bestätigt.
- Schlüssel und Tokens nie in den Chat, nie ins Repo. Tokens per Befehl direkt in `.env` schreiben, Werte nie ausgeben.
- Nach jedem Test des Nutzers aufräumen: Testtexte zurücksetzen, offene Entwürfe prüfen.
