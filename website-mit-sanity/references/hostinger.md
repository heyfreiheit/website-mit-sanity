# Veröffentlichen bei Hostinger

Stand November 2026, Quellen: docs.hostinger.com (Node.js, Git) und Hostinger-Support. Hostinger ändert Tarifnamen und Menüs gelegentlich. Wenn etwas im hPanel anders heißt, nach dem sinngemäßen Punkt suchen.

## Welcher Tarif

Die Seite ist ein Node-Server. Den kann Hostinger nur in **Web Unlimited** (früher Business) und **Cloud** (Startup, Professional, Enterprise) betreiben. Frag zuerst nach dem Tarif.

Bei Unlimited oder Cloud geht es mit dem Weg unten: eine Web-App, Visual Editing inklusive, Veröffentlichungen nach Sekunden online.

Premium und Single können kein Node.js. Dann entweder den Tarif wechseln (empfohlen) oder die Seite statisch bauen (`output: 'static'`, ohne Vorschau-Modus) und per GitHub Actions + FTP hochladen. Dann braucht es zusätzlich eine Brücke, damit eine Veröffentlichung in Sanity einen Neubau anstößt: Ein Sanity-Webhook ruft GitHubs `repository_dispatch` auf, eine Action baut und lädt hoch. Visual Editing gibt es auf diesem Weg nicht. Diesen Weg nur gehen, wenn der Nutzer ausdrücklich nicht wechseln will.

Den Menüpunkt „Erweitert“ und dort „Git“ im Website-Dashboard **nicht** nehmen. Er kopiert nur Dateien und baut nichts.

## Web-App aus GitHub (macht der Nutzer im hPanel)

1. **Websites**, dann **Website hinzufügen**, dann **Node.js-Web-App**.
2. **Connect with GitHub.** Das installiert die Hostinger-GitHub-App. Nur das eine Repo freigeben. Private Repos gehen.
3. Repo und Branch `main` wählen, dann:

| Feld | Wert |
|---|---|
| Framework / Application type | Astro |
| Node.js-Version | 24, falls angeboten, sonst 22 (`engines` in `package.json` beachten) |
| Root directory | leer |
| Build script | `build` |
| Output directory | `dist` |
| Entry file | `server/entry.mjs` |
| Package manager | npm |

   Der Pfad im Entry file ist relativ zum Ausgabeordner, also nicht `dist/server/entry.mjs`. Ein Feld für einen Start-Befehl gibt es nicht, den Port setzt Hostinger über `PORT`.

4. Unter **Environment variables** unbedingt `SANITY_API_READ_TOKEN` eintragen. Ohne die Variable läuft die Seite ganz normal, nur Visual Editing nicht, deshalb wird dieser Schritt leicht vergessen. Den Wert gibt der Nutzer selbst ein, nie in den Chat.
   - Über „Import .env“ mit der lokalen `.env`. Auf dem Mac ist die Datei im Finder und im Dateiauswahl-Fenster unsichtbar, Cmd+Shift+Punkt blendet sie ein.
   - Oder von Hand: Name `SANITY_API_READ_TOKEN`, Wert per Zwischenablage, ohne dass er irgendwo angezeigt wird: `grep '^SANITY_API_READ_TOKEN=' .env | cut -d= -f2- | tr -d '\n' | pbcopy`. Danach `echo -n | pbcopy`.

   Die Seite liest den Token erst beim Start (`process.env`), er steckt also nie im Build. Nach dem Eintragen die App neu starten oder neu deployen und mit `curl -s -w " (%{http_code})\n" <LIVE_URL>/api/draft-mode/enable/` prüfen: 401 heißt gesetzt, 500 heißt fehlt.
5. **Deploy.** Ab jetzt baut jeder Push auf `main` neu. Inhalte aus Sanity brauchen keinen Push.
6. Zuerst die vorläufige Hostinger-Adresse nehmen. Ist die Domain im Tarif schon als normale Website angelegt, muss diese vorher entfernt werden, sonst lässt sie sich der Web-App nicht zuweisen.

Gut zu wissen:
- Die Hostinger-GitHub-App ist mit genau einem GitHub-Account oder einer Organisation verbunden. Das Repo muss dort liegen. Liegt es woanders, mit `gh api -X POST repos/<alt>/<repo>/transfer -f new_owner=<org>` übertragen (Verlauf bleibt, alter Link leitet weiter) und lokal `git remote set-url` anpassen. Ist die App nur für ausgewählte Repos freigegeben, das neue Repo in den GitHub-App-Einstellungen dazunehmen.
- Ein GitHub-Account pro Hosting-Tarif, den teilen sich alle Web-Apps darin.
- Installieren und Bauen haben je 15 Minuten Zeit, die Logs der letzten 10 Builds stehen im Dashboard.
- Eine Node-App schläft ohne Besucher ein. Der erste Aufruf nach einer Pause dauert ein paar Sekunden. Das dem Nutzer vorher sagen.
- Hostinger bietet laut Doku keinen eigenen „Neubau-Link“ für Web-Apps. Das ist ein Grund für den Server-Betrieb: Inhalte brauchen keinen Neubau.

## Nach dem ersten Deploy

Mit der Live-Adresse (vorläufig oder Domain):

1. `studio/presentation.ts`: `LIVE_URL` setzen.
2. `cd studio && npx sanity cors add <LIVE_URL> --credentials -y`
3. `npx sanity deploy -y`
4. Committen, pushen.

## Domain und SSL

1. Domain verbinden: Nameserver aus dem hPanel beim Domain-Anbieter eintragen oder A-Records für `@` und `www` auf die IP aus dem Website-Dashboard setzen. Wirkt meist nach ein paar Stunden, spätestens nach 48.
2. SSL: Bei Web-Apps nach dem Verbinden prüfen, ob `https://` funktioniert. Sonst im Dashboard unter „Sicherheit“ bei „SSL“ installieren und HTTPS erzwingen.
3. Neue Domain in `LIVE_URL`, CORS und `astro.config.mjs` (`site`) nachziehen, Studio neu deployen.
4. Prüfen: `https://domain.de`, `https://www.domain.de` und `http://domain.de` landen auf derselben `https`-Adresse.

## Abschlusstest

Zuerst ohne Login per Befehl:

```bash
U=<LIVE_URL>
curl -s -w " (%{http_code})\n" $U/api/draft-mode/enable/
# „Invalid secret (401)“: Token ist gesetzt. „not configured (500)“: Variable fehlt in Hostinger.
cd studio && npx sanity exec scripts/set-field.ts --with-user-token -- home heroTitle.de "TEST"
start=$(date +%s); until curl -s "$U/de/" | grep -q TEST; do sleep 1; done; echo "online nach $(( $(date +%s)-start ))s"
npx sanity exec scripts/set-field.ts --with-user-token -- home heroTitle.de "<alter Text>"
```

Zehn Sekunden oder weniger ist richtig. Deutlich mehr heißt: Es läuft noch ein alter Stand, oder `useCdn` steht auf `true`. Antwort-Header prüfen: `x-hcdn-cache-status: DYNAMIC` heißt, Hostinger cacht die Seite nicht.

Dann mit dem Nutzer:

1. Im Online-Studio einen Text ändern und veröffentlichen.
2. Live-Seite nach etwa zehn Sekunden neu laden: Änderung ist da.
3. Im Reiter „Presentation“ die Live-Seite sehen, einen Text anklicken, Entwurf ändern, Vorschau beobachten, Entwurf verwerfen.
4. Erst dann gilt das Hosting als fertig.
