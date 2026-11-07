# Übergabe an den Kunden

Geh die Liste mit dem Nutzer durch. Was nicht erledigt ist, steht am Ende ausdrücklich im Bericht.

## Seite

- [ ] `npm run build` läuft fehlerfrei, die Web-App startet
- [ ] Desktop, Handy und reduzierte Bewegung geprüft (Screenshots)
- [ ] alle Sprachen vollständig, von jemandem gegengelesen, der die Sprache spricht
- [ ] Impressum und Datenschutz vorhanden und verlinkt
- [ ] `noindex` entfernt, Titel und Beschreibung für Google gesetzt
- [ ] Kontakt-, Buchungs- und Social-Links funktionieren
- [ ] alle Fotos haben Bildbeschreibungen

## Repo

- [ ] privat, richtiger Account
- [ ] keine Schlüssel, Tokens oder `.env` im Verlauf (`git log -p | grep -E "sk[a-zA-Z0-9]{20,}|AIza|ghp_|github_pat_"` findet nichts)
- [ ] `README.md` erklärt Befehle, Aufbau, was im Studio pflegbar ist und den Hosting-Weg

## Sanity

- [ ] `npx sanity schemas validate` meldet 0 Fehler
- [ ] Online-Studio deployt, Sprache der Oberfläche und Feldnamen wie mit dem Kunden besprochen
- [ ] jede Seite im Studio geöffnet, alle Felder gefüllt
- [ ] Teständerung veröffentlicht, online gesehen, zurückgesetzt
- [ ] Visual Editing auf der Live-Adresse getestet (Presentation, Text und Foto anklicken)
- [ ] keine offenen Entwürfe (`documents query '*[_id in path("drafts.**")]'`)

## Kunden einladen und Besitz übergeben

Kunde ins Projekt einladen (er bekommt eine Mail und legt beim Annehmen ein Sanity-Konto an):

```bash
cd studio && npx sanity users invite kunde@example.com --role editor
```

`editor` kann alle Inhalte bearbeiten und veröffentlichen, aber keine Projekteinstellungen ändern. Soll der Kunde später selbst Personen einladen können: `administrator`.

Soll der Kunde das Projekt ganz besitzen: Unter sanity.io/manage die Organisation öffnen, den Kunden dort als Administrator hinzufügen, ihm die Abrechnung übergeben und sich danach selbst entfernen oder auf eine eingeschränkte Rolle setzen. Das macht der Nutzer selbst im Browser, Schritt für Schritt mit ihm durchgehen.

Den Lese-Token für die Vorschau braucht nur der Server (Hostinger). Er läuft nicht ab, kann aber unter sanity.io/manage im Bereich „API“ bei „Tokens“ jederzeit gelöscht und neu angelegt werden. Dann den neuen Wert bei Hostinger eintragen.

## Kurzanleitung für den Kunden

Gib dem Nutzer diesen Text angepasst mit (Name, Studio-Adresse, Sprache des Kunden):

> So änderst du Inhalte auf deiner Webseite: Öffne <studio-adresse> und melde dich an. Links siehst du alle Bereiche der Seite. Klick einen an, ändere Text oder Foto und drück unten rechts auf „Veröffentlichen“. Nach ein paar Sekunden ist die Änderung online.
>
> Noch einfacher geht es im Reiter „Presentation“ oben: Dort siehst du deine Webseite. Fahr mit der Maus über einen Text oder ein Foto und klick drauf, dann öffnet sich rechts das passende Feld. Du siehst sofort, wie es aussieht. Online geht es erst, wenn du auf „Veröffentlichen“ klickst.
>
> Fotos: Foto anklicken, „Hochladen“ oder neues Foto hineinziehen. Fotos vom Handy gehen direkt, die Seite verkleinert sie automatisch. Mit dem Fokuspunkt im Bild legst du fest, was beim Zuschneiden immer sichtbar bleibt. Schreib unter „Bildbeschreibung“ kurz, was darauf zu sehen ist.
>
> Kaputt machen kannst du nichts: Jede Fassung wird gespeichert und lässt sich über den Verlauf (Uhr-Symbol oben rechts) zurückholen.

## Was beim Entwickler bleibt

Layout, neue Abschnitte, neue Seitentypen, Farben, Schriften, Animationen und neue Felder im Studio. Das ist der Vorteil dieser Übergabe: Der Kunde pflegt alles, kann aber nichts am Aufbau zerschießen.
