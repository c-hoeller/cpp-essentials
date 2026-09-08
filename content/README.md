# Lerninhalte bearbeiten

Jede Datei in diesem Ordner enthält genau einen Themenabschnitt als HTML-Fragment. Die Reihenfolge, ID, Gruppe und Überschrift stehen in `manifest.json`.

Nach einer Änderung an einem Fragment oder am Manifest wird die Browser-Datei neu erzeugt:

```sh
node scripts/build_lerninhalte.mjs
```

Die Seite selbst lädt anschließend weiterhin nur lokale Dateien und funktioniert dadurch auch beim direkten Öffnen von `cpp_referenz_lernmodus.html` ohne Webserver.

## Übungssektion aktualisieren

Die Gruppe „Übungen“ (Dateien `16_*.html` bis `45_*.html`) wird nicht von Hand gepflegt, sondern aus dem externen Übungs-Repository generiert. Nach Änderungen an den dortigen Lösungen:

```sh
node scripts/build_uebungen.mjs && node scripts/build_lerninhalte.mjs
```

`build_uebungen.mjs` enthält je Übung Aufgabentext, Beispiele und Titel als Daten sowie den Pfad zur Quelle; die eigentliche Lösung wird beim Ausführen frisch aus der `.cpp`-Datei gelesen.
