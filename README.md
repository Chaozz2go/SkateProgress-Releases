# SkateProgress 🛹

**Tricks üben, Sessions festhalten und Fortschritte sehen.** SkateProgress ist eine Android-App für Skateboarderinnen und Skateboarder. Sie funktioniert für deine Skate-Daten offline, ohne Konto oder eigenen Server. Die App ist noch in der **Alpha-Phase**: Funktionen können sich ändern und Fehler sind möglich.

## Was kann die App?

- **Trickliste:** Kategorien wie Basics, Flatground, Fakie, Nollie, Switch, Grinds & Slides, Transition und Freestyle. Du kannst eigene Tricks hinzufügen, Favoriten markieren, Tricks als „Kann ich“ oder „Übe ich“ einordnen und YouTube-Links hinterlegen.
- **Sessions:** Wähle bekannte Tricks und Übungstricks aus. Während des Skatens zählt ein Tipp auf **+** jeden gestandenen Trick. Aufwärmtricks lassen sich markieren; per Tipp auf einen Trick erreichst du seine Details und den hinterlegten Videolink.
- **Fortschritt:** Sieh deine Statistiken und abgeschlossenen Sessions im Verlauf.
- **S.K.A.T.E.:** Trage Spielernamen ein, wähle das Wort für die Runde und zähle die Buchstaben mit.
- **Wiki:** Suche Skate-Begriffe nach Begriff oder Kategorie und ergänze eigene Einträge.
- **Profil:** Hinterlege Nickname, vorderen Fuß, Push-Fuß und dein Setup mit Board, Achsen, Kugellagern und Rollen.

Die neue **teilbare Profilkarte** mit Vorschau, Alpha-Hinweis und App-Link ist im Quellcode für Version 0.13.0 vorbereitet. Ob sie schon in deiner APK steckt, erkennst du an der Versionsnummer des [neuesten veröffentlichten Releases](https://github.com/Chaozz2go/SkateProgress-Releases/releases/latest). Die Karte wird erst nach deiner Auswahl über Android geteilt.

## Herunterladen und installieren

1. Öffne [**Releases – neueste Version**](https://github.com/Chaozz2go/SkateProgress-Releases/releases/latest).
2. Klappe bei der Version **Assets** auf und lade die Datei `SkateProgress-v…apk` herunter.
3. Öffne die APK auf deinem Android-Gerät und bestätige die Installation. Die App benötigt **Android 8 oder neuer**.
4. Für spätere Updates kannst du in der App unter **Einstellungen → Jetzt auf Updates prüfen** nachsehen. Wenn eine neuere Version verfügbar ist, zeigt die App die Dateigröße und beim Download den Fortschritt an.

Die APK wird außerhalb des Play Store verteilt. Android kann für diese Quelle eine Installationsfreigabe verlangen. Falls **Google Play Protect die App ausdrücklich als schädlich blockiert**, nimm die Meldung ernst und [melde uns Version und Screenshot als Problem](https://github.com/Chaozz2go/SkateProgress-Releases/issues/new?template=vorschlag.yml); die Ursache muss für die konkrete APK geprüft werden. Bei v0.12.0 wurde eine solche Blockierung beobachtet; die Ursache ist bisher nicht sicher geklärt.

**Debug-Version installiert?** Eine Debug-APK und eine öffentlich signierte Release-APK haben unterschiedliche Signaturen. Android kann sie dann nicht direkt übereinander installieren. Eine Deinstallation löscht die lokal gespeicherten Daten; sichere wichtige Angaben vorher manuell, falls du von einer Debug-Version wechselst.

## Trickliste und Wiki teilen

Ab **Version 0.14.0** kannst du unter **Einstellungen → Inhalte teilen** deine komplette Trickliste, das Wiki oder beides als JSON-Datei über Android teilen. Das umfasst auch selbst ergänzte Einträge und hinterlegte YouTube-Links. Du wählst selbst die Ziel-App oder Person. Persönliche Markierungen, Trefferzahlen, Session-Verlauf und Profildaten sind nicht in der Datei enthalten.

Die Datei ist für das Weitergeben von Inhalten gedacht. Ein Import in SkateProgress oder ein vollständiges Backup deiner persönlichen Daten ist derzeit nicht vorhanden.

## Daten und Updates

Tricks, Profil, Wiki und Session-Verlauf werden auf deinem Gerät gespeichert. Du brauchst kein Konto. Das Löschen der App kann diese lokalen Daten entfernen. Eine Funktion zum Export persönlicher Backups ist derzeit nicht enthalten.

Die App greift für die **Updateprüfung und den APK-Download** auf GitHub zu; YouTube-Links werden bei Bedarf außerhalb der App geöffnet. Beim Teilen deiner Profilkarte wählst du selbst eine Ziel-App aus. Die App veröffentlicht deine Skate-Daten nicht automatisch.

## Ideen oder Fehler melden

Öffne [**Neuen Vorschlag oder Fehler melden**](https://github.com/Chaozz2go/SkateProgress-Releases/issues/new?template=vorschlag.yml). Dafür brauchst du ein GitHub-Konto. Beschreibe möglichst genau, was du gemacht hast, was passiert ist und welche App-Version du benutzt. Screenshots helfen bei Darstellungsfehlern. Issues sind öffentlich: Bitte keine Passwörter, privaten Daten, Signierschlüssel oder vollständigen persönlichen Datenbanken posten.

Dieses Repository enthält die öffentliche Beschreibung, Vorschläge und die APKs unter **Releases**. Der Quellcode liegt in einem privaten Entwicklungs-Repository.
