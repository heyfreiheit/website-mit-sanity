# Website mit Sanity

Ein Skill für Claude Code (läuft auch mit Codex).

Mit diesem Skill baust du mit Claude Code eine richtig hochwertige Webseite, die dein Kunde danach selbst pflegt. Texte und Fotos liegen in Sanity, einem Redaktionssystem, das sich wie eine moderne App anfühlt. Das Beste daran: Dein Kunde sieht im Studio seine echte Webseite, klickt einen Text oder ein Foto an und ändert es direkt dort. Sanity nennt das Visual Editing.

Der Skill führt Claude durch den kompletten Weg. Zuerst entsteht die Seite mit Scrollcraft und Impeccable, auf Wunsch mehrsprachig. Dann richtet Claude Sanity ein, mit eigener Organisation für deinen Kunden und dem Studio in seiner Sprache. Danach kommt Visual Editing dazu, der Code wandert in ein privates GitHub-Repo, und die Seite läuft als eine einzige Web-App bei Hostinger. Eine Änderung im Studio ist nach ein paar Sekunden online, ohne dass irgendwas neu gebaut werden muss. Am Ende bekommst du eine Übergabe-Checkliste und eine kurze Anleitung für deinen Kunden.

Entstanden ist das Ganze am Neubau der Seite eines Yogastudios auf den Lofoten, auf Norwegisch und Englisch. Alle Fallen, in die ich dabei gelaufen bin, stehen in den Referenzen, damit du sie nicht noch mal suchen musst.

## Installation

1. Repo holen und den Skill-Ordner in deine Skills kopieren:
   ```bash
   git clone https://github.com/heyfreiheit/website-mit-sanity.git
   cp -R website-mit-sanity/website-mit-sanity ~/.claude/skills/
   ```
   Ohne Git: oben auf „Code“ und „Download ZIP“, entpacken und den inneren Ordner `website-mit-sanity` nach `~/.claude/skills/` legen. Für Codex kommt er nach `~/.codex/skills/`.
2. Die beiden Design-Skills installieren:
   - Scrollcraft von Nate Herk (MIT) für Seiten mit richtig schicken Scroll-Animationen. In Claude Code:
     ```
     /plugin marketplace add nateherkai/scroll-craft
     /plugin install nateherk-design
     ```
   - Impeccable von Paul Bakaus (Apache 2.0) für sauberes Design ohne KI-Look, zum Prüfen und Polieren. Das installiert Claude später im Projektordner, damit es nicht in all deinen anderen Projekten mitläuft.
3. Claude Code in einem leeren Ordner starten und zum Beispiel sagen: „Bau mir eine Webseite für <Kunde> mit Sanity, die mein Kunde selbst pflegen kann.“ Hast du schon eine alte Seite, gib die Adresse mit, dann übernimmt Claude Texte und Fotos.

## Was du brauchst

- Node.js 22 oder neuer und Git
- einen GitHub-Account und die GitHub-CLI (`gh auth login`)
- einen kostenlosen Account bei Sanity (sanity.io)
- zum Veröffentlichen Hostinger ab dem Tarif Web Unlimited oder Cloud, weil die Seite dort als kleine Node.js-App läuft. In den kleineren Tarifen geht das nicht, der Skill erklärt dir die Alternative.

## So läuft es ab

Claude fragt dich kurz nach Kunde, Sprachen, Hosting und in welcher Sprache dein Kunde das Studio sehen soll. Dann baut Scrollcraft die Seite, Impeccable prüft sie und Claude behebt, was gefunden wird. Alle Texte schreibt Claude erst in eine Startdatei, damit die Seite schon läuft, bevor es Sanity überhaupt gibt. Danach legt Claude das Sanity-Projekt per Befehl an, spielt alle Inhalte samt Fotos ein und baut Visual Editing ein.

An ein paar Stellen musst du selbst ran: beim Login in Sanity und GitHub, beim ersten Test im Studio und bei den Einstellungen im Hostinger-Panel. Claude sagt dir jeweils genau, was du wo eintragen musst. Schlüssel und Passwörter landen dabei nie im Chat.

Einen Schritt vergisst man leicht, deshalb hier extra: Deine Web-App bei Hostinger braucht die Umgebungsvariable `SANITY_API_READ_TOKEN`. Das ist der Lese-Token, mit dem die Seite im Studio auch Entwürfe zeigen kann. Ohne ihn läuft die Seite ganz normal, nur Visual Editing klappt nicht, und das merkst du erst ganz am Ende. Claude schreibt den Token in die Datei `.env` im Projektordner. Die ist auf dem Mac unsichtbar, weil sie mit einem Punkt beginnt (Cmd+Shift+Punkt blendet sie ein). Am einfachsten legt Claude dir den Wert in die Zwischenablage, und du fügst ihn in Hostinger unter „Environment variables“ ein. Danach die App einmal neu starten.

## Dateien

Alles liegt im Ordner `website-mit-sanity/`:

- `SKILL.md`: der Ablauf für Claude, Phase für Phase
- `references/architektur.md`: wie die Seite aufgebaut sein muss, plus die Gestaltungsfallen aus dem Testprojekt
- `references/sanity.md`: Organisation, Projekt, Schema, Import, Studio-Sprache, Deploy, alles per Befehl
- `references/visual-editing.md`: wie die Seite im Studio anklickbar wird und wie du das ohne Login prüfst
- `references/hostinger.md`: die Web-App bei Hostinger, Feld für Feld
- `references/uebergabe.md`: Checkliste, Kunden einladen, Projekt übergeben, Anleitung für deinen Kunden
- `templates/`: die Dateien, die Claude in dein Projekt kopiert (Ladedatei, Vorschau-Modus, Studio-Konfiguration, Beispiel-Schema, Startinhalte)

## Lizenz

MIT, siehe `LICENSE`. Scrollcraft (github.com/nateherkai/scroll-craft) und Impeccable (github.com/pbakaus/impeccable) sind eigenständige Skills ihrer Autoren und nicht Teil dieses Repos. Sanity ist ein Dienst von Sanity AS.
