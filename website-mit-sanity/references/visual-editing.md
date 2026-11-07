# Visual Editing: die Seite im Studio anklicken und ändern

Im Studio gibt es den Reiter „Presentation“. Er zeigt die echte Seite. Fährt der Kunde mit der Maus über einen Text oder ein Foto, erscheint ein Rahmen, ein Klick öffnet rechts genau dieses Feld. Während er tippt, lädt die Vorschau neu und zeigt den Entwurf, noch bevor er veröffentlicht.

Es ist kein Pagebuilder: Abschnitte verschieben oder Layout ändern geht nicht. Für eine Übergabe ist genau das gewollt.

## Wie es zusammenspielt

1. Das Studio lädt die Seite in einem Rahmen und ruft `/api/draft-mode/enable/` mit einem Einmal-Geheimnis auf.
2. `enable.ts` prüft das Geheimnis mit `validatePreviewUrl` (braucht den Lese-Token) und setzt das Cookie `sanity-draft-mode`. Sein Wert ist ein Hash aus dem Token, den nur der Server erzeugen kann.
3. `middleware.ts` vergleicht bei jedem Aufruf das Cookie mit diesem Wert und legt das Ergebnis in einen `AsyncLocalStorage` (`request-context.ts`). So weiß `content.ts` pro Anfrage, ob Entwürfe geladen werden, auch wenn viele Anfragen gleichzeitig laufen.
4. Im Vorschau-Modus lädt `content.ts` mit `perspective: 'drafts'` und schaltet **Stega** ein: Jeder übersetzbare Text bekommt unsichtbare Zeichen, die sagen, aus welchem Dokument und Feld er stammt.
5. `VisualEditing.astro` lädt nur dann das Paket `@sanity/visual-editing`. Das findet die Markierungen und zeichnet die Rahmen. Bei einer Änderung im Studio lädt die Seite nach einer halben Sekunde neu. Der Browser behält dabei die Scroll-Position, auch auf Scroll-Seiten.

Normale Besucher bekommen weder Entwürfe noch Markierungen noch das Overlay-Paket.

## Was anklickbar ist

- **Texte** automatisch über Stega, aber nur die übersetzbaren Felder und der eigentliche Text im formatierten Text. Der Filter in `content.ts` lässt IDs, Slugs, Daten, Mailadressen, Auswahlwerte, Absatz-Stile und Link-Adressen bewusst aus. Würde man alles markieren, gingen Vergleiche, Links und die Darstellung von formatiertem Text kaputt.
- **Fotos, Zahlen, Listen** brauchen ein Attribut, das `editable()` liefert:

```astro
<figure data-sanity={editable(doc, 'photo')}>…</figure>
<figure data-sanity={editable(home, `introPhotos[_key=="${foto._key}"]`)}>…</figure>
<dd data-sanity={editable(prices, `groups[_key=="${g._key}"].items[_key=="${it._key}"].amount`)}>…</dd>
```

Außerhalb des Vorschau-Modus gibt `editable()` `undefined` zurück, das Attribut fällt dann weg.

Bei Listen immer über `_key` adressieren, nie über die Position.

## Studio: `presentation.ts`

- `LOCAL_URL`: lokaler Dev-Server der Seite.
- `LIVE_URL`: die Live-Adresse. Bis die Seite online ist, gleich `LOCAL_URL` lassen.
- `mainDocuments`: welche Seite zu welchem Dokument gehört, damit beim Durchklicken das richtige Dokument daneben aufgeht.
- `locations`: an jedem Dokument die Liste „wird auf diesen Seiten verwendet“.

Jede Adresse, auf der die Seite läuft, braucht eine CORS-Freigabe mit Zugangsdaten:

```bash
cd studio && npx sanity cors add <URL> --credentials -y
```

Nach einer Änderung an `presentation.ts` das Online-Studio neu deployen (`npx sanity deploy -y`).

## Prüfen

Ohne Studio-Login lässt sich fast alles per `curl` prüfen:

```bash
# Schalter ohne Geheimnis muss abgelehnt werden
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/api/draft-mode/enable/        # 401
# Gefälschtes Cookie darf nichts zeigen
curl -s -b "sanity-draft-mode=true" http://localhost:4321/de/ | grep -c "ve-badge"            # 0
# Echter Vorschau-Modus: Cookie-Wert lokal aus dem Token berechnen, nicht anzeigen
V=$(python3 -c "import hashlib;t=[l.split('=',1)[1].strip() for l in open('.env') if l.startswith('SANITY_API_READ_TOKEN=')][0];print(hashlib.sha256(('draft-mode:'+t).encode()).hexdigest()[:40])")
curl -s -b "sanity-draft-mode=$V" http://localhost:4321/de/ | python3 -c "import sys,re;h=sys.stdin.read();print('Badge',('ve-badge' in h),'| data-sanity',len(re.findall('data-sanity=',h)),'| Stega',bool(re.search('[​‌‍⁠﻿]',h)))"
# Normaler Besuch: nichts davon
curl -s http://localhost:4321/de/ | grep -c "data-sanity="                                       # 0
```

Den Test im Studio selbst macht der Nutzer: einloggen, Reiter „Presentation“, Text anklicken, ändern, Vorschau beobachten. Danach mit `documents query` nachsehen, ob ein Testtext veröffentlicht wurde, und zurücksetzen.

## Fallen

- Kommt ein markierter Wert in `new Date()`, einen Vergleich oder eine URL, vorher `clean()`. Mit dem mitgelieferten Filter passiert das bei normalen Feldern nicht.
- Markierte Texte in `alt`, `<title>` oder einem `mailto:`-Betreff sind im Vorschau-Modus harmlos. Für Links mit Text als Parameter trotzdem `clean()`.
- Ohne Token liefert `enable.ts` eine klare Fehlermeldung, die Seite selbst läuft normal weiter.
- Das Cookie braucht `sameSite: 'none'` und `secure: true`, weil das Studio auf einer anderen Adresse liegt. `localhost` gilt im Browser als sicher, lokal klappt es also auch ohne HTTPS.
