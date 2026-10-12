# SkateProgress Web Demo — Alpha 0.8

Installierbare Offline-PWA auf GitHub Pages. Ohne Login; alle persönlichen Daten bleiben im jeweiligen Browser. Eigene Daten werden nicht ins Repository hochgeladen.

Enthalten: Tricksuche und separate Frontside-/Backside-Karten, Regular/Fakie/Nollie/Switch im Detailmenü, Sessions und Verlauf, Profil und PNG-Profilkarte, S.K.A.T.E., Trick Roulette, Wiki mit 37 Grundbegriffen und eigenen Einträgen, Parks mit komprimierten Fotos und Maps-Links, Trainingspläne mit Reihenfolge und Landungszielen, 15 Aufgaben im Anfänger-Lernpfad sowie Fortschrittszahlen.

Unter Einstellungen vollständiges JSON-Backup exportieren/importieren. Android-Backups übernehmen zusätzlich Parks/Fotos, eigene Wiki-Begriffe, Spieler, Pläne und Lernpfad. Markierungen und Verlauf werden ergänzt. Identische Park-/Plan-IDs bleiben bestehen; das importierte Profil wird übernommen. Bereits laufende Sessions bleiben bestehen. Fotos müssen PNG/JPEG/WebP/GIF sein, maximal etwa 2 MB pro importiertem Bild. Gesamtdaten maximal 10 MB. Neue Fotos werden auf maximal 1000 Pixel verkleinert. Android-Sessionzähler werden als Versuche übernommen; getrennte Landungen sind im alten Format nicht enthalten.

Für Updates alle Appfenster vollständig schließen und neu öffnen. Browser können lokalen Speicher entfernen; wichtige Backups extern sichern. Die Datenbank, Login und geräteübergreifende Synchronisierung gehören zur selbst gehosteten Serverversion.

Automatische Modell-/Bedienlogik- und API-Prüfungen bestanden. Echte Browser-/Handyprüfungen stehen aus. Noch nicht portiert: SkateRunner-Minispiel, Drag-and-drop-Kachelanordnung und Android-spezifische Drive-/APK-Updatefunktionen.

## Bedienung im Skate-Modus

Auf der Startseite **Skate-Modus** wählen. Session, Heute üben, Tricks und Games stehen im Vordergrund; **Alle Bereiche** bringt die normale Startseite zurück. Die Wahl bleibt auf diesem Gerät gespeichert. Im Fokusmodus erscheint ein Trick pro Seite mit Vorheriger/Nächster. Fehlversuch und Gelandet zählen je einen Versuch, Gelandet zusätzlich eine Landung. Die letzten 20 Eingaben lassen sich einzeln rückgängig machen, auch nach erneutem Öffnen einer laufenden Session. Backups übernehmen Zähler; die temporäre Undo-Historie wird beim Import zurückgesetzt. Trickliste behält Suche, geöffnete Kategorien und Scrollposition während der Navigation. Sessions und Trainingspläne bieten eine Suche nach Tricks und wählen die Stance separat.
