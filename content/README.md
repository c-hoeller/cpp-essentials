# Lerninhalte bearbeiten

Jede Datei in diesem Ordner enthält genau einen Themenabschnitt als HTML-Fragment. Die Reihenfolge, ID, Gruppe und Überschrift stehen in `manifest.json`.

Nach einer Änderung an einem Fragment oder am Manifest wird die Browser-Datei neu erzeugt:

```sh
node scripts/build_lerninhalte.mjs
```

Die Seite selbst lädt anschließend weiterhin nur lokale Dateien und funktioniert dadurch auch beim direkten Öffnen von `cpp_referenz_lernmodus.html` ohne Webserver.
