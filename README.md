# SkateProgress Web Demo — Alpha 0.10

Installierbare Offline-PWA auf GitHub Pages. Ohne Login; alle persönlichen Daten bleiben im jeweiligen Browser. Eigene Daten werden nicht ins Repository hochgeladen.

Enthalten: Tricksuche und separate Frontside-/Backside-Karten, Regular/Fakie/Nollie/Switch im Detailmenü, Sessions und Verlauf, Profil und PNG-Profilkarte, S.K.A.T.E., Trick Roulette, Wiki mit 37 Grundbegriffen und eigenen Einträgen, Parks mit komprimierten Fotos und Maps-Links, Trainingspläne mit Reihenfolge und Landungszielen, 15 Aufgaben im Anfänger-Lernpfad sowie Fortschrittszahlen.

Unter Einstellungen vollständiges JSON-Backup exportieren/importieren. Android-Backups übernehmen zusätzlich Parks/Fotos, eigene Wiki-Begriffe, Spieler, Pläne und Lernpfad. Markierungen und Verlauf werden ergänzt. Identische Park-/Plan-IDs bleiben bestehen; das importierte Profil wird übernommen. Bereits laufende Sessions bleiben bestehen. Fotos müssen PNG/JPEG/WebP/GIF sein, maximal etwa 2 MB pro importiertem Bild. Gesamtdaten maximal 10 MB. Neue Fotos werden auf maximal 1000 Pixel verkleinert. Android-Sessionzähler werden als Versuche übernommen; getrennte Landungen sind im alten Format nicht enthalten.

Für Updates alle Appfenster vollständig schließen und neu öffnen. Browser können lokalen Speicher entfernen; wichtige Backups extern sichern. Die Datenbank, Login und geräteübergreifende Synchronisierung gehören zur selbst gehosteten Serverversion.

Automatische Modell-/Bedienlogik- und API-Prüfungen bestanden. Echte Browser-/Handyprüfungen stehen aus. Noch nicht portiert: SkateRunner-Minispiel, Drag-and-drop-Kachelanordnung und Android-spezifische Drive-/APK-Updatefunktionen.

## Bedienung im Skate-Modus

Auf der Startseite **Skate-Modus** wählen. Session, Heute üben, Tricks und Games stehen im Vordergrund; **Alle Bereiche** bringt die normale Startseite zurück. Die Wahl bleibt auf diesem Gerät gespeichert. Im Fokusmodus erscheint ein Trick pro Seite mit Vorheriger/Nächster. Fehlversuch und Gelandet zählen je einen Versuch, Gelandet zusätzlich eine Landung. Die letzten 20 Eingaben lassen sich einzeln rückgängig machen, auch nach erneutem Öffnen einer laufenden Session. Backups übernehmen Zähler; die temporäre Undo-Historie wird beim Import zurückgesetzt. Trickliste behält Suche, geöffnete Kategorien und Scrollposition während der Navigation. Sessions und Trainingspläne bieten eine Suche nach Tricks und wählen die Stance separat.

## Neuer Lernweg

18 Levels mit 72 Challenges und 18 möglichen Abzeichen. Sechs Wege: Grundlagen, No-Pop & Style, Flatground, Transition, Ledges & Slides sowie Switch & Nollie. Eine grafische Levelkarte zeigt offene, abgeschlossene und gesperrte Levels. Gesperrte Levels bleiben als Vorschau lesbar. XP werden aus abgeschlossenen Challenges berechnet und nicht für wiederholte Klicks addiert. Teilziele werden gespeichert und im JSON-Backup mitgeführt. Ältere Android-Lernpfad-Häkchen bleiben erhalten. Bekannte Ziele lassen sich je freigeschaltetem Level selbst bestätigen. Kein Tages-Streak, Zeitlimit, Höhenziel oder Geschwindigkeitsbonus. Fortschritt wird selbst bestätigt, nicht durch Sensoren geprüft.

Der Weg ist ein eigener SkateProgress-Entwurf: Unterrichtsreihenfolge, Wiederholungen und XP sind Orientierung, keine offizielle Kurskopie oder Zertifizierung. Grundlagen richten sich nach Stand, Balance, Pushen, Lenken und Bremsen. Nach sicherem Fahren können Rampen und andere Wege unabhängig von Flips begonnen werden. Erste Coping-Tricks empfehlen geeignete Anleitung. Die Recherchequellen sind auch in der App verlinkt:

- https://skateboardgb.org/beginners/cruiser-award/
- https://skateboardgb.org/beginners/learn-to-skate-guide/
- https://www.brailleskateboarding.com/products/level-2-fundamentals
- https://www.brailleskateboarding.com/products/skateboarding-made-simple-volume-1-digital-download
- https://skateiq.com/collections/bundles/products/core-90-day-program

29 automatisierte Frontend-/Modell-/Offline-Prüfungen bestehen, inklusive Freischaltung, XP ohne Doppelzählung und Backup von Teilzielen. Ein echter Handytest steht weiterhin aus.

## Wiki, Boards und automatische Trickmarkierung

Wiki-Erklärungen verlinken andere vorhandene Begriffe und eigene Wiki-Einträge, einschließlich gängiger Synonyme. Detailseiten enthalten Board-, Rampen- und Stance-Grafiken, inklusive lokal gebündelter Commons-Bilder mit Quellen/Lizenzen in `assets/ATTRIBUTION.md`. Das Profil zeigt Regular/Goofy und Normal/Mongo live bei Änderung der beiden Fuß-Einstellungen. Komponenten stehen in aufklappbaren Board-Karten; mehrere Boards können angelegt, bearbeitet, als aktiv gewählt und gelöscht werden. Vorhandene Setups werden einmalig übernommen und beim Backupimport bleiben vorhandene Boards erhalten. Neue Sessions merken sich den Namen des aktiven Boards.

Eine bislang weder mit Kann ich noch Übe ich markierte Trickvariante wird beim dritten bestätigten Gelandet-Eintrag in derselben laufenden Session automatisch zu Kann ich. Fehlversuche und andere Varianten werden nicht mitgezählt. Undo des dritten Eintrags entfernt die automatische Markierung, sofern sie nicht inzwischen manuell bearbeitet wurde. Bereits gelernte und vorgemerkte Übe-Tricks werden nicht geändert. Session-Abbruch lässt die Trickmarkierungen bestehen.

38 automatische Frontend-/Modellprüfungen bestehen. Fotos, native Teilfunktion und visuelles Layout weiterhin auf dem Zielgerät testen.
