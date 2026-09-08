// Importiert die Übungen aus dem externen Übungs-Repository und erzeugt daraus
// content/<n>_<id>.html Fragmente + passende Einträge in content/manifest.json.
//
// Quelle: lokales Repo mit den bearbeiteten CPP22-Übungen (Aufgabenstellung als
// <id>.md, fertige Lösung als <id>.cpp). Nach Änderungen an den Lösungen dort
// kann dieses Skript erneut ausgeführt werden, gefolgt von build_lerninhalte.mjs.
//
//   node scripts/build_uebungen.mjs && node scripts/build_lerninhalte.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDirectory = path.join(rootDirectory, "content");
const manifestPath = path.join(contentDirectory, "manifest.json");

const SOURCE_ROOT = "/Users/christoph/Developer/university.bsc-inf.cpp-exercises/cpp22-uebungen";
const GROUP = "Übungen";
const START_ORDER = 16; // erste freie Nummer nach 15_praeprozessor.html
const START_CODE_ID = 49; // erste freie code-N id nach code-48

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let codeIdCounter = START_CODE_ID;
function codeBlock({ label, lang, code }) {
  const id = "code-" + codeIdCounter++;
  const preClass = lang ? `line-numbers language-${lang}` : "";
  return (
    '<div class="code-block"><div class="code-block-header"><span>' +
    escapeHtml(label) +
    '</span><button class="copy-btn" type="button" data-copy-target="' +
    id +
    '">Kopieren</button></div><pre' +
    (preClass ? ` class="${preClass}"` : "") +
    "><code id=\"" +
    id +
    '"' +
    (lang ? ` class="language-${lang}"` : "") +
    ">" +
    escapeHtml(code.trim()) +
    "</code></pre></div>"
  );
}

function examplesTable(pairs) {
  const rows = pairs
    .map(
      ([input, output]) =>
        "<tr><td><code>" +
        escapeHtml(input === "" ? "(leer)" : input) +
        "</code></td><td><code>" +
        escapeHtml(output) +
        "</code></td></tr>"
    )
    .join("");
  return (
    '<table class="cmp"><tr><th>Eingabe</th><th>Ausgabe</th></tr>' + rows + "</table>"
  );
}

function note(html) {
  return '<div class="note"><strong>Beispiel:</strong> ' + html + "</div>";
}

function crc32(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
    }
  }
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980) - 1980;
  return {
    date: (year << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

// Kleiner ZIP-Schreiber ohne externe Abhängigkeit. Die Pakete bleiben dadurch
// bei jeder Generierung reproduzierbar aus den aktuellen Vorlagen erzeugbar.
function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const timestamp = dosDateTime(new Date());

  for (const entry of entries) {
    const filename = Buffer.from(entry.name, "utf8");
    const content = Buffer.from(entry.content, "utf8");
    const compressed = deflateRawSync(content);
    const checksum = crc32(content);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8-Dateinamen
    local.writeUInt16LE(8, 8); // Deflate
    local.writeUInt16LE(timestamp.time, 10);
    local.writeUInt16LE(timestamp.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(filename.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, filename, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4); // erstellt unter Unix, ZIP 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(timestamp.time, 12);
    central.writeUInt16LE(timestamp.date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE((entry.mode ?? 0o100644) * 0x10000, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, filename);

    offset += local.length + filename.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

// Entfernt die repetitiven AKAD-Arbeitsanweisungen aus den Lösungsdateien
// (reine Bedienhinweise fürs Bearbeiten/Einreichen), ohne den eigentlichen
// Code (Funktionen, eval()-Testkabelage, Programmlogik) zu verändern.
// Hinweis: "eval" bezieht sich hier durchgehend auf die C++-Testfunktion
// eval() aus den Übungsdateien (reiner Textabgleich in den .cpp-Quellen),
// nicht auf JavaScript eval() – es wird an keiner Stelle Code ausgeführt.
function cleanSolutionSource(source) {
  let result = source;
  result = result.replace(/\/\/ Folgende Header müssen beibehalten werden[^\n]*\n\n?/, "");
  result = result.replace(
    /^[ \t]*\/\/ (Schreiben Sie hier den Code für Ihre zu erstellende (Funktion|Klasse):|Programmieren Sie hier Ihre Funktion:|Strukturdefinition: Definieren Sie hier Ihre Struktur \w+)[ \t]*\n\n?/m,
    ""
  );
  result = result.replace(/[ \t]*\/\/ Die Methode eval darf nicht verändert werden\n/, "");
  result = result.replace(/\/\/ Fügen Sie hier den Code ein[\s\S]*?\n(\s*)eval\(\);/, "$1eval();");
  return result.trim();
}

function readSolution(dir) {
  const file = path.join(SOURCE_ROOT, dir, dir + ".cpp");
  return cleanSolutionSource(fs.readFileSync(file, "utf8"));
}

// --- Übungsvorlagen (Downloads) ---
//
// Jede Vorlage ist bewusst eigenständig kompilierbar (kein separates eval.h
// nötig): benötigte Test-Makros aus eval.h werden direkt in die Datei
// übernommen. Die eigentliche Lösung wird durch einen TODO-Platzhalter
// ersetzt, das eval()-Testgerüst (falls vorhanden) bleibt vollständig und
// unverändert erhalten, damit direkt gegen die Beispiele getestet werden kann.

const EVAL_MACROS = {
  _AKAD_INI1: "int i1; std::cin >> i1;",
  _AKAD_INI2: "int i2; std::cin >> i2;",
  _AKAD_INI3: "int i3; std::cin >> i3;",
  _AKAD_INI4: "int i4; std::cin >> i4;",
  _AKAD_INI5: "int i5; std::cin >> i5;",
  _AKAD_IND1: "double d1; std::cin >> d1;",
  _AKAD_INS1: "string s1; std::getline(cin, s1);",
  _AKAD_INS2: "string s2; std::getline(cin, s2);",
};

// Die Vorlagen werden lokal in CMD/Terminal ausgeführt. Damit nicht der
// Eindruck eines hängenden Programms entsteht, steht der Eingabehinweis auf
// stderr; stdout bleibt ausschließlich für die Ergebnis-Ausgabe reserviert.
const INTERACTIVE_INPUT_SUPPORT = `
void showInteractiveInputHint()
{
    std::cerr << "Testeingabe eingeben (siehe README oder Beispiele), dann Enter: " << std::flush;
}
`;

function harnessTemplate({ macros, body, evalBody, extraHeaders = [] }) {
  const defines = macros.map((m) => `#define ${m} ${EVAL_MACROS[m]}`).join("\n");
  const headers = ["#include <iostream>", "#include <cstdlib>", "#include <string>", ...extraHeaders];
  return `${headers.join("\n")}
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
${defines}

${body.trim()}

// Die Methode eval darf nicht verändert werden
void eval()
{
${evalBody}
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
`;
}

const DEFAULT_TEMPLATE = `#include <iostream>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

int main()
{
    showInteractiveInputHint();

    // TODO: Aufgabe lösen (siehe Aufgabenstellung)

    return 0;
}
`;

const TEMPLATES = {
  allegleich: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2", "_AKAD_INI3", "_AKAD_INI4", "_AKAD_INI5"],
    body: `bool allegleich(int* arr, int anzahl)
{
    printf("-%s-\\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}`,
    evalBody: `    int a1[20] = { 1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2 };
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5
     a1[i2] = i3; a1[i4] = i5;
    cout << (allegleich(a1, i1) ? "G" : "N") << endl;`,
  }),

  copydistinct: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2", "_AKAD_INI3", "_AKAD_INI4", "_AKAD_INI5"],
    body: `int copyDistinct(int *source, int *dest, int anzahl)
{
    // TODO: Ihre Lösung hier

    return 0;
}`,
    evalBody: `    int a1[20];
    // Die Initialisierung hält die Vorlage auch vor der eigenen Lösung
    // ausführbar; copyDistinct() soll die benötigten Werte überschreiben.
    int a2[20] = {};
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5 for (int i = 0; i < i1; i++)
        a1[i] = i;
    a1[3] = i2;
    a1[5] = i3;
    a1[7] = i4;
    a1[9] = i5;

    cout << copyDistinct(a1, a2, i1) << endl;
    cout << a2[3] << a1[3] << a2[4] << a2[5] << endl;`,
  }),

  enthaeltzahl: harnessTemplate({
    macros: ["_AKAD_INS1"],
    extraHeaders: ["#include <cstring>"],
    body: `bool enthaelt_zahl(const char * str)
{
    printf("-%s-\\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}`,
    evalBody: `    _AKAD_INS1 cout << (enthaelt_zahl(s1.c_str()) ? "E" : "N");`,
  }),

  grossbuchstaben: harnessTemplate({
    macros: ["_AKAD_INS1"],
    body: `int anzahlGrossbuchstaben(const string &str)
{
    // TODO: Ihre Lösung hier

    return 0;
}`,
    evalBody: `    _AKAD_INS1 cout << "eval:" << ((anzahlGrossbuchstaben(s1) == 0) ? 'N' : anzahlGrossbuchstaben(s1));`,
  }),

  istquadratzahl: harnessTemplate({
    macros: ["_AKAD_INI1"],
    body: `bool istQuadratzahl(int n)
{
    printf("%s\\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}`,
    evalBody: `    _AKAD_INI1
    cout << (istQuadratzahl(i1) ? "T" : "F") << endl;`,
  }),

  kaufrund: harnessTemplate({
    macros: ["_AKAD_IND1"],
    body: `double kaufrund(double number)
{
    printf("-%s-\\n", __func__);

    // TODO: Ihre Lösung hier

    return 0.0;
}`,
    evalBody: `    _AKAD_IND1 cout << kaufrund(d1) << endl;`,
  }),

  maxpos: harnessTemplate({
    macros: ["_AKAD_INI1"],
    body: `int maxpos(int *arr, int len)
{
    printf("%s\\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}`,
    evalBody: `    _AKAD_INI1
    int ia[10] = { 4,1,2,8,9,1,3,9,2,4 };
    cout << maxpos(&(ia[i1]), 10 - i1) << endl;`,
  }),

  mehrzeilig: harnessTemplate({
    macros: ["_AKAD_INS1"],
    body: `void ausgabeMehrzeilig(const string &str)
{
    // TODO: Ihre Lösung hier
}`,
    evalBody: `    _AKAD_INS1 ausgabeMehrzeilig(s1);`,
  }),

  mischen: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2", "_AKAD_INI3", "_AKAD_INI4", "_AKAD_INI5"],
    body: `int *mischen(int *arr1, int *arr2, int laenge_arr)
{
    // TODO: Ihre Lösung hier

    // Neutrales, aber gültiges Ergebnis, damit das Testgerüst mit
    // simulierter Eingabe nicht abstürzt, bevor die Lösung ergänzt ist.
    return new int[2 * laenge_arr]{};
}`,
    evalBody: `    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5 int a[] = {2, 6, 7, 8, 9, 2, 4, 5};
    int b[] = {3, 7, 6, 3, 5, 6, 8, 2};
    a[i1] = i2;
    b[i3] = i4;
    int *c = mischen(a, b, i5);
    for (int i = 0; i < 2 * i5; i++)
        cout << c[i];
    cout << endl;
    delete[] c;`,
  }),

  mitarbeiter: harnessTemplate({
    macros: ["_AKAD_INS1", "_AKAD_INS2", "_AKAD_INI1"],
    body: `class Mitarbeiter
{
    static int nummerManager;
    int pnr;
    string vorname;
    string nachname;

public:
    Mitarbeiter(string vname, string nname)
    {
        // TODO: Ihre Lösung hier (nummerManager erhöhen, pnr setzen, vorname/nachname übernehmen)
    }

public:
    int getPnr()
    {
        // TODO: Ihre Lösung hier
        return 0;
    }
};

int Mitarbeiter::nummerManager = 100;`,
    evalBody: `    _AKAD_INS1 _AKAD_INS2 _AKAD_INI1 for (int i = 0; i < i1; i++)
    {
        Mitarbeiter *m = new Mitarbeiter(s1, s2);
        delete m;
    }
    Mitarbeiter m(s1, s2);
    cout << m.getPnr() << endl;`,
  }),

  palindron: harnessTemplate({
    macros: ["_AKAD_INS1"],
    extraHeaders: ["#include <cstring>"],
    body: `bool ist_palindron(const char *str)
{
    printf("-%s-\\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}`,
    evalBody: `    _AKAD_INS1 cout << (ist_palindron(s1.c_str()) ? "P" : "K");`,
  }),

  qsumme: harnessTemplate({
    macros: ["_AKAD_INI1"],
    body: `int qsumme(int number)
{
    printf("%s\\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}`,
    evalBody: `    _AKAD_INI1
    cout << qsumme(i1) << endl;`,
  }),

  reversefind: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2"],
    body: `int reverseFind(long feld[], int len, long suchwert)
{
    printf("-%s-\\n", __func__);

    // TODO: Ihre Lösung hier

    return -1;
}`,
    evalBody: `    _AKAD_INI1 _AKAD_INI2 long a[23] = {2, 6, 8, 9, 2, 4, 6, 8, 1, 2, 6, 3, 8, 6, 3, 6, 8, 9, 2, 3, 6, 2, 3};
    cout << reverseFind(a, i1, i2);`,
  }),

  swap: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2"],
    body: `void swap(int *a, int *b)
{
    // TODO: Ihre Lösung hier
}`,
    evalBody: `    _AKAD_INI1 _AKAD_INI2 swap(&i1, &i2);
    cout << (i1 * 11 + i2 * 3) << endl;`,
  }),

  vektoraddition: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2", "_AKAD_INI3", "_AKAD_INI4", "_AKAD_INI5"],
    body: `struct vektor
{
    int x;
    int y;
    int z;
};

vektor addVektor(const vektor *a, const vektor *b)
{
    // TODO: Ihre Lösung hier

    return vektor{};
}`,
    evalBody: `    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5
        vektor a{i1, i2, i3};
    vektor b{i1, i4, i5};
    vektor c = addVektor(&a, &b);
    cout << c.x + c.y + c.z;`,
  }),

  vergroessern: harnessTemplate({
    macros: ["_AKAD_INI1", "_AKAD_INI2", "_AKAD_INI3", "_AKAD_INI4"],
    body: `int *vergroessern(int *arr, int laenge_arr)
{
    printf("%s%d\\n", __func__, arr[1]);

    // TODO: Ihre Lösung hier

    // Neutrales, aber gültiges Ergebnis, damit das Testgerüst mit
    // simulierter Eingabe nicht abstürzt, bevor die Lösung ergänzt ist.
    return new int[laenge_arr + 2]{};
}`,
    evalBody: `    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 int a[] = {2, 6, 7, 8, 9, 2, 4, 5};
    a[i1] = i2;
    int *c = vergroessern(a, i3);
    cout << c[i4];
    cout << endl;
    delete[] c;`,
  }),

  getvalue: `#include <stdio.h>
#include <iostream>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

int get_value(const int * arr, int pos)
{
    printf("%s\\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}

int main()
{
    showInteractiveInputHint();
    int pos;
    int a [] = {5,7,32,5,7,3,5,7};
    cin >> pos;
    cout << get_value (a,pos) << endl;
    return 0;
}
`,

  persname: `#include <iostream>
#include <cstdlib>
#include <string>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

struct pers
{
    string vname;
    string nname;
};

void eval(pers * p)
{
   cout << __func__<< p->nname << p->vname;
}

int main()
{
    showInteractiveInputHint();
    // TODO: Ihre Lösung hier (Variable vom Typ pers anlegen, Vor-/Nachname einlesen, eval(&variable) aufrufen)

    return 0;
}
`,

  ausgabe: `#include <iostream>
#include <cstdio>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

void ausgabe(const int *p)
{
    printf("%s\\n", __func__);

    // TODO: Ihre Lösung hier
}

int main()
{
    showInteractiveInputHint();
    int arr[20];

    for (int i = 0; i < 20; i++)
    {
        cin >> arr[i];
        if (arr[i] == -1) break;
    }

    ausgabe(arr);

    return 0;
}
`,

  matrixaddition: `#include <iostream>
#include <cstdlib>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

int main() {
    showInteractiveInputHint();
    int a[5][5] = { { 1,2,3,4,5 }, {2,7,5,3,4}, {5,4,3,2,1}, {7,7,7,7,7}, {3,6,3,6,3} };
    // Initialisierung verhindert eine Ausgabe unbestimmter Werte, solange
    // der TODO-Block noch nicht bearbeitet wurde.
    int b[5] = {};
    // **********************************
    // *** Ende der Programmvorgaben ****
    // Schreiben Sie hier Ihren Code

    // TODO: Ihre Lösung hier

    // **********************************
    // Der nachfolgende Code dient der Evaluation
    // und darf nicht verändert werden.
    int x1, x2;
    cin >> x1; cin >> x2;
    for (int i = x1; i <= x2; i++) {
         cout << b[i] << endl;
    }
    return 0;
}
`,

  sincos: `#include <iostream>
#include <cmath>
${INTERACTIVE_INPUT_SUPPORT}
using namespace std;

int main()
{
    showInteractiveInputHint();
    double number;
    cin >> number;

    // TODO: Sinus und Cosinus berechnen und ausgeben

    return 0;
}
`,
};

function templateFor(ex) {
  return TEMPLATES[ex.id] || ex.extraVorgabe || DEFAULT_TEMPLATE;
}

// Eine sofort nutzbare Testeingabe pro Übung. Sie steht sowohl im
// Starterpaket als auch im lokalen Smoke-Test zur Verfügung.
const STARTER_INPUTS = {
  allegleich: "10 1 1 2 1",
  arraysumme: "0",
  asciicode: "66",
  ausgabe: "1 2 -1",
  copydistinct: "15 20 21 22 23",
  enthaeltzahl: "2",
  getvalue: "4",
  grossbuchstaben: "Hildegunst Mythenmetz",
  istquadratzahl: "9",
  kaufrund: "1.145",
  kiste: "1 2 3 1 2 3",
  matrixaddition: "1 2",
  matrixwert: "2 2",
  maxpos: "0",
  median: "1 3 2",
  mehrzeilig: "Gregory.Peck",
  mischen: "0 2 0 3 3",
  mitarbeiter: "Gregory\nPeck\n5",
  palindron: "hannah",
  persname: "Max Mustermann",
  potenz: "2 5",
  qsumme: "5",
  restsubtraktion: "5 7",
  reversefind: "15 4",
  sekunden: "45",
  sincos: "0.0",
  swap: "2 5",
  uhrzeitminus: "12:34 20",
  vektoraddition: "4 2 3 1 2",
  vergroessern: "1 2 4 5",
  zinsen: "10 0",
};

function starterReadme(ex) {
  return `# ${ex.title}

Du musst nur die Stelle mit \`TODO\` in \`${ex.id}.cpp\` implementieren.
Alle Datenstrukturen, Ein-/Ausgabe und das Testgerüst sind bereits enthalten.

## Starten

Windows: \`start.bat\` doppelklicken.

macOS/Linux: In einem Terminal in diesem Ordner \`bash start.sh\` ausführen.

Beide Skripte benötigen einen C++-Compiler (\`g++\` bzw. \`c++\`).

## Testeingabe

Beim Start fordert das Programm eine Testeingabe an. Diese Eingabe funktioniert
direkt mit dem enthaltenen Testgerüst:

\`\`\`text
${STARTER_INPUTS[ex.id]}
\`\`\`

Die vollständige Aufgabenbeschreibung steht in \`Aufgabe.md\`.
`;
}

function windowsStartScript(ex) {
  return `@echo off
setlocal
cd /d "%~dp0"

where g++ >nul 2>nul
if errorlevel 1 (
  echo Fehler: Kein g++-Compiler gefunden.
  echo Installiere z. B. MSYS2/MinGW-w64 oder starte die Vorlage in einer C++-IDE.
  pause
  exit /b 1
)

g++ -std=c++20 -Wall -Wextra -Wpedantic "${ex.id}.cpp" -o "${ex.id}.exe"
if errorlevel 1 (
  echo.
  echo Kompilierung fehlgeschlagen. Pruefe den TODO-Block in ${ex.id}.cpp.
  pause
  exit /b 1
)

echo.
"${ex.id}.exe"
echo.
pause
`;
}

function unixStartScript(ex) {
  return `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

compiler="\${CXX:-c++}"
"$compiler" -std=c++20 -Wall -Wextra -Wpedantic "${ex.id}.cpp" -o "${ex.id}"
echo
"./${ex.id}"
`;
}

function starterPackageEntries(ex) {
  const directory = ex.id + "/";
  const taskPath = path.join(SOURCE_ROOT, ex.id, ex.id + ".md");
  return [
    { name: directory + ex.id + ".cpp", content: templateFor(ex) },
    { name: directory + "start.bat", content: windowsStartScript(ex) },
    { name: directory + "start.sh", content: unixStartScript(ex), mode: 0o100755 },
    { name: directory + "README.md", content: starterReadme(ex) },
    { name: directory + "Aufgabe.md", content: fs.readFileSync(taskPath, "utf8") },
  ];
}

const EXERCISES = [
  {
    id: "allegleich",
    title: "Alle Werte im Array gleich?",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>allegleich</code>, der ein Integer-Array sowie die Anzahl der Elemente übergeben wird. Rückgabetyp ist <code>bool</code>. Die erste Anweisung der Funktion muss <code>printf("-%s-\\n", __func__);</code> sein. Geprüft wird, ob alle Werte im Array identisch sind &ndash; ist das der Fall, liefert die Funktion <code>true</code>, sonst <code>false</code>.</p>`,
    extra: note(`<code>allegleich({7,7,7}, 3)</code> &rarr; <code>true</code>, <code>allegleich({7,7,8}, 3)</code> &rarr; <code>false</code>.`),
  },
  {
    id: "arraysumme",
    title: "Array mit 17er-Vielfachen summieren",
    lead: `<p class="lead">Erzeugen Sie ein Integer-Array der Länge 10 und füllen Sie es in einer Schleife mit Vielfachen von 17, sodass an Position <code>i</code> der Wert <code>i * 17</code> steht. Lassen Sie danach den Benutzer eine Zahl von 0 bis 9 eingeben, setzen Sie den Array-Eintrag an dieser Position auf 0 und geben Sie die Summe aller Arraywerte aus.</p>`,
    examples: [
      ["0", "765"],
      ["1", "748"],
      ["4", "697"],
    ],
  },
  {
    id: "asciicode",
    title: "Zahl in ASCII-Zeichen umwandeln",
    lead: `<p class="lead">Lassen Sie den Benutzer eine Zahl eingeben und geben Sie danach das Zeichen mit diesem ASCII-Code aus.</p>`,
    examples: [
      ["66", "B"],
      ["50", "2"],
    ],
  },
  {
    id: "ausgabe",
    title: "Array bis Sentinelwert ausgeben",
    lead: `<p class="lead">Erzeugen Sie in <code>main</code> ein Integer-Array der Länge 20 und befüllen Sie es ab Index 0 mit Werten aus der Standardeingabe, bis der Benutzer <code>-1</code> eingibt (die <code>-1</code> wird mit ins Array eingetragen; ein Test auf die Arraygrenze 20 ist nicht nötig). Rufen Sie damit eine Funktion mit einem der beiden folgenden Prototypen auf: <code>void ausgabe(const int * p);</code> oder <code>void ausgabe(const int p[]);</code>. Erste Anweisung der Funktion muss <code>printf("%s\\n", __func__);</code> sein. Danach ist der Arrayinhalt bis (ausschließlich) zur ersten <code>-1</code> auszugeben, je Wert mit Zeilenumbruch, ohne weitere erläuternde Ausgaben.</p>`,
    examples: [
      ["1 2 3 4 5 -1", "ausgabe 1 2 3 4 5"],
      ["1 2 -1", "ausgabe 1 2"],
    ],
  },
  {
    id: "copydistinct",
    title: "Duplikate aus Array entfernen",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>copyDistinct</code> mit dem Prototyp <code>int copyDistinct(int * source, int * dest, int anzahl)</code>. Sie soll lückenlos ab Position 0 alle Werte aus <code>source</code> nach <code>dest</code> kopieren, dabei aber jeden Wert nur einmal übernehmen &ndash; doppelte Werte in <code>source</code> landen also nur einmal in <code>dest</code>. Rückgabewert ist die Anzahl der kopierten (distinct) Werte.</p>`,
    extra: note(`<code>source = {3,6,7,7,2,1,3,3}</code> (8 Werte) &rarr; <code>dest = {3,6,7,2,1}</code>, Rückgabewert <code>5</code>.`),
  },
  {
    id: "enthaeltzahl",
    title: "String: nur Ziffern enthalten?",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>bool enthaelt_zahl(const char * str)</code>. Erste Anweisung muss <code>printf("-%s-\\n", __func__);</code> sein. Die Funktion prüft, ob die Zeichenkette ausschließlich aus Ziffern besteht und mindestens eine Ziffer enthält &ndash; nur dann liefert sie <code>true</code>.</p>`,
    extra: note(`<code>enthaelt_zahl("123")</code> &rarr; <code>true</code>, <code>enthaelt_zahl("12a")</code> und <code>enthaelt_zahl("")</code> &rarr; <code>false</code>.`),
  },
  {
    id: "getvalue",
    title: "Array-Element per Zeiger lesen",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>int get_value(const int * arr, int pos)</code>, die den Wert des übergebenen Arrays an Position <code>pos</code> zurückgibt. Erster Befehl der Funktion muss <code>printf("%s\\n", __func__);</code> sein.</p>`,
    extraVorgabe: `#include <stdio.h>
#include <iostream>
using namespace std;

int get_value (const int * arr, int pos){
  printf("%s\\n", __func__);

  return arr[pos-1];
}

int main()
{
   int pos;
   int a [] = {5,7,32,5,7,3,5,7};
   cin >> pos;
   cout << get_value (a,pos) << endl;
   return 0;
}`,
    examples: [
      ["4", "get_value 7"],
      ["2", "get_value 32"],
    ],
  },
  {
    id: "grossbuchstaben",
    title: "Großbuchstaben in String zählen",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>int anzahlGrossbuchstaben(const string &amp; str)</code>, die zählt, wie viele Großbuchstaben ('A' bis 'Z') in der übergebenen Zeichenkette enthalten sind, und diese Anzahl zurückgibt.</p>`,
    extra: note(`<code>anzahlGrossbuchstaben("Hallo Welt")</code> &rarr; <code>2</code> (H, W).`),
  },
  {
    id: "istquadratzahl",
    title: "Quadratzahl-Test per Schleife",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>istQuadratzahl</code>, der ein Integer übergeben wird und die einen <code>bool</code> zurückgibt. Erste Anweisung muss <code>printf("%s\\n", __func__);</code> sein. Geprüft wird (bewusst unperformant per aufsteigender Schleife, dafür einfach umzusetzen), ob das Argument eine Quadratzahl ist &ndash; also das Ergebnis der Multiplikation einer ganzen Zahl größer 0 mit sich selbst (z. B. 1, 4, 9, 16).</p>`,
    extra: note(`<code>istQuadratzahl(9)</code> &rarr; <code>true</code> (3&sup2;), <code>istQuadratzahl(10)</code> &rarr; <code>false</code>.`),
  },
  {
    id: "kaufrund",
    title: "Kaufmännisch runden",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>kaufrund</code>, die einen <code>double</code>-Wert auf zwei Nachkommastellen kaufmännisch rundet (bei der Grenze 5 wird aufgerundet) und als Funktionswert zurückgibt. Erster Befehl der Funktion muss <code>printf("-%s-\\n", __func__);</code> sein.</p>`,
    examples: [
      ["1.145", "1.15"],
      ["1.144", "1.14"],
      ["0.005", "0.01"],
      ["2.5", "2.5"],
      ["1.115", "1.12"],
      ["1.111", "1.11"],
      ["1.126", "1.13"],
    ],
  },
  {
    id: "kiste",
    title: "Schachteln in eine Kiste packen",
    lead: `<p class="lead">Lassen Sie den Benutzer Höhe, Breite und Länge einer Kiste eingeben, danach Höhe, Breite und Länge von Schachteln (jeweils in dieser Reihenfolge). Berechnen Sie, wie viele Schachteln vollständig in die Kiste passen &ndash; ohne Drehen, jede Seite bleibt an der entsprechenden Kistenseite ausgerichtet. Geben Sie nur das Ergebnis aus.</p>`,
    examples: [
      ["1 2 3 1 2 3", "1"],
      ["2 4 6 1 2 3", "8"],
      ["4 5 8 1 2 3", "16"],
    ],
  },
  {
    id: "matrixaddition",
    title: "Matrixzeile und -spalte addieren",
    lead: `<p class="lead">Im Basisprogramm sind eine 5&times;5-Matrix <code>a</code> und ein Vektor <code>b</code> vorgegeben. Addieren Sie die dritte Zeile (Index 2) von <code>a</code> komponentenweise mit der vierten Spalte (Index 3) von <code>a</code> und tragen Sie das Ergebnis an der jeweils gleichen Position in <code>b</code> ein. Der vorgegebene, gekennzeichnete Code am Anfang und Ende von <code>main</code> darf nicht verändert werden.</p>`,
    examples: [
      ["1 2", "7 5"],
      ["2 4", "5 9 7"],
    ],
  },
  {
    id: "matrixwert",
    title: "Matrixwert mit Bereichsprüfung",
    lead: `<p class="lead">Initialisieren Sie ein zweidimensionales Integer-Array mit folgenden Werten:</p>`,
    extraDiagram: `2  5  7  9  2  4
1  7  3  7  9  2
3  6  8  2  5  8`,
    leadAfterDiagram: `<p>Der Benutzer gibt eine Zeilen- und eine Spaltennummer ein (Zählung ab 0). Ausgegeben wird der Wert an dieser Position, bzw. <code>-1</code>, wenn die Position außerhalb des Arrays liegt.</p>`,
    examples: [
      ["4 4", "-1"],
      ["2 2", "8"],
      ["1 3", "7"],
    ],
  },
  {
    id: "median",
    title: "Mittlere von drei Zahlen finden",
    lead: `<p class="lead">Lassen Sie den Benutzer drei unterschiedliche Zahlen eingeben und geben Sie diejenige aus, die zahlenmäßig in der Mitte liegt (von der es also eine kleinere und eine größere gibt). Keine weiteren Ausgaben.</p>`,
    examples: [
      ["1 3 2", "2"],
      ["3 6 1", "3"],
    ],
  },
  {
    id: "mehrzeilig",
    title: "String nach Satzende umbrechen",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>void ausgabeMehrzeilig(const string &amp; str)</code>, die die übergebene Zeichenkette buchstabenweise ausgibt und nach jedem <code>'.'</code>-Zeichen (direkt nach dessen Ausgabe) einen Zeilenumbruch erzeugt.</p>`,
    extra: note(`<code>ausgabeMehrzeilig("Gregory.Peck")</code> gibt zwei Zeilen aus: <code>Gregory.</code> und <code>Peck</code>.`),
  },
  {
    id: "mischen",
    title: "Zwei Arrays ineinander mischen",
    lead: `<p class="lead">Schreiben Sie eine Funktion mit dem Prototyp <code>int * mischen(int * arr1, int * arr2, int laenge_arr)</code> für zwei gleich lange Integer-Arrays. Sie legt dynamisch ein neues, doppelt so langes Array an und trägt die Werte abwechselnd ein: erst <code>arr1[0]</code>, dann <code>arr2[0]</code>, dann <code>arr1[1]</code>, <code>arr2[1]</code> usw. Das neue Array wird zurückgegeben.</p>`,
    extra: note(`<code>mischen({1,3,5}, {2,4,6}, 3)</code> &rarr; <code>{1,2,3,4,5,6}</code>.`),
  },
  {
    id: "mitarbeiter",
    title: "Klasse Mitarbeiter mit Personalnummer",
    lead: `<p class="lead">Setzen Sie folgende Klassendefinition um:</p>`,
    extraDiagram: `Mitarbeiter
-  int nummerManager   (static)
-  int pnr
-  string vorname
-  string nachname
+  Mitarbeiter(vname: string, nname: string)
+  getPnr(): int`,
    leadAfterDiagram: `<p>Das statische Klassenelement <code>nummerManager</code> wird mit 100 initialisiert. Im Konstruktor wird zuerst <code>nummerManager</code> um eins erhöht, der neue Wert wird dann als Personalnummer des erzeugten Mitarbeiters verwendet. Alle übrigen Attribute werden aus den Parametern übernommen.</p>`,
    extra: note(`Wird das erste <code>Mitarbeiter</code>-Objekt im Programm erzeugt, liefert <code>getPnr()</code> <code>101</code> (100&nbsp;+&nbsp;1), das nächste <code>102</code> usw.`),
  },
  {
    id: "palindron",
    title: "Palindrom-Test (C-String)",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>bool ist_palindron(const char * str)</code>. Erste Anweisung muss <code>printf("-%s-\\n", __func__);</code> sein. Sie prüft, ob die Zeichenkette ein Palindrom ist (vorwärts gelesen dasselbe Wort wie rückwärts gelesen, z. B. <code>HANNAH</code>). Es kommen dabei nur Groß- oder nur Kleinbuchstaben vor.</p>`,
    extra: note(`<code>ist_palindron("hannah")</code> &rarr; <code>true</code>, <code>ist_palindron("hello")</code> &rarr; <code>false</code>.`),
  },
  {
    id: "persname",
    title: "Struct für Vor- und Nachname",
    lead: `<p class="lead">Gegeben ist folgende Struktur:</p>`,
    extraDiagram: `struct pers {
   string vname;
   string nname;
};`,
    leadAfterDiagram: `<p>Erzeugen Sie eine Variable dieses Typs, lassen Sie den Benutzer Vor- und Nachname eingeben (ohne erläuternde Ausgaben), befüllen Sie die Variable damit und rufen Sie die vorgegebene Funktion <code>eval</code> mit einer Referenz auf Ihre Variable auf:</p>`,
    extraVorgabe: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

void eval(pers * p)
{
   cout << __func__<< p->nname << p->vname;
}

int main()
{
   return 0;
}`,
    examples: [
      ["Max Mustermann", "evalMustermannMax"],
      ["Erika Musterfrau", "evalMusterfrauErika"],
    ],
  },
  {
    id: "potenz",
    title: "Potenz iterativ mit Zwischenwerten",
    lead: `<p class="lead">Lassen Sie den Benutzer einen <code>double</code>-Wert <code>x</code> und danach einen Integer <code>n</code> eingeben. Berechnen Sie <code>x&#8319;</code> in einer Schleife (x kommt n-mal als Faktor vor) und geben Sie nach jeder Multiplikation das Zwischenergebnis in einer eigenen Zeile aus (also x&sup1;, x&sup2;, x&sup3;, &hellip;). Der zuletzt ausgegebene Wert ist das Endergebnis und muss nicht nochmals ausgegeben werden.</p>`,
    examples: [
      ["2 5", "2 4 8 16 32"],
      ["3 4", "3 9 27 81"],
      ["4 1", "4"],
    ],
  },
  {
    id: "qsumme",
    title: "Quersumme einer Zahl berechnen",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>qsumme</code>, der ein Integer übergeben wird. Erste Anweisung muss <code>printf("%s\\n", __func__);</code> sein. Ist der Wert kleiner als 0, wird <code>-1</code> zurückgegeben. Ansonsten die Quersumme (Summe aller Ziffern, bei 125 also 1+2+5). Hinweis: <code>%10</code> liefert die letzte Ziffer einer Integerzahl.</p>`,
    extra: note(`<code>qsumme(125)</code> &rarr; <code>8</code> (1+2+5).`),
  },
  {
    id: "restsubtraktion",
    title: "Modulo durch fortlaufende Subtraktion",
    lead: `<p class="lead">Der Rest einer Ganzzahldivision <code>a % b</code> lässt sich auch durch fortlaufendes Subtrahieren bestimmen: solange <code>a &gt;= b</code> ist, wird <code>b</code> von <code>a</code> abgezogen, bis <code>a &lt; b</code> ist &ndash; der verbleibende Rest ist das Ergebnis. Lassen Sie den Benutzer <code>a</code>, dann <code>b</code> eingeben, geben Sie in der Schleife nach jeder Subtraktion den neuen Wert von <code>a</code> aus und am Ende nochmals das Gesamtergebnis. Keine weiteren Ausgaben.</p>`,
    examples: [
      ["5 7", "5"],
      ["22 7", "15 8 1 1"],
      ["35 7", "28 21 14 7 0 0"],
    ],
  },
  {
    id: "reversefind",
    title: "Letztes Vorkommen im Array finden",
    lead: `<p class="lead">Entwickeln Sie eine Funktion <code>int reverseFind(long feld[], int len, long suchwert)</code>, die die Position des <em>letzten</em> Vorkommens von <code>suchwert</code> im Array liefert, bzw. <code>-1</code>, falls die Zahl nicht vorkommt. Erste Anweisung muss <code>printf("-%s-\\n", __func__);</code> sein.</p>`,
    extra: note(`<code>reverseFind({2,6,8,9,2,4}, 6, 2)</code> &rarr; <code>4</code> (letztes Vorkommen von 2), <code>reverseFind({2,6,8,9,2,4}, 6, 5)</code> &rarr; <code>-1</code>.`),
  },
  {
    id: "sekunden",
    title: "Sekunden in hh:mm:ss umrechnen",
    lead: `<p class="lead">Lesen Sie eine Anzahl Sekunden ein und rechnen Sie sie in Stunden, Minuten (max. 59) und Sekunden (max. 59) um. Geben Sie die drei Werte jeweils in einer eigenen Zeile aus, ohne erläuternden Text.</p>`,
    examples: [
      ["45", "0 0 45"],
      ["130", "0 2 10"],
      ["7300", "2 1 40"],
    ],
  },
  {
    id: "sincos",
    title: "Sinus und Cosinus ausgeben",
    lead: `<p class="lead">Lesen Sie eine Gleitpunktzahl ein und geben Sie ihren Sinus und Cosinus aus. Keine weiteren Ausgaben. Der vorgegebene, gekennzeichnete Code am Anfang und Ende von <code>main</code> darf nicht verändert werden.</p>`,
    examples: [
      ["0.0", "0 1"],
      ["2.5", "0.598472 -0.801144"],
      ["5.6", "-0.631267 0.775566"],
    ],
  },
  {
    id: "swap",
    title: "Zwei Variablen per Zeiger vertauschen",
    lead: `<p class="lead">Bei einem Aufruf wie <code>swap(&amp;i, &amp;j);</code> soll eine Funktion <code>swap</code> die Werte der beiden über Zeiger übergebenen <code>int</code>-Variablen vertauschen, sodass nach dem Aufruf in <code>i</code> der ursprüngliche Wert von <code>j</code> steht und umgekehrt.</p>`,
    extra: note(`<code>i=3, j=8</code>; nach <code>swap(&amp;i, &amp;j)</code>: <code>i=8, j=3</code>.`),
  },
  {
    id: "uhrzeitminus",
    title: "Uhrzeit minus Minuten berechnen",
    lead: `<p class="lead">Der Benutzer gibt eine Uhrzeit im Format <code>hh:mm</code> ein (beide Teile immer zweistellig) sowie eine Anzahl Minuten. Berechnen und geben Sie die Uhrzeit aus, die sich ergibt, wenn man diese Minutenanzahl von der eingegebenen Uhrzeit zurückrechnet (ebenfalls im Format <code>hh:mm</code>). Ein Tageswechsel muss nicht berücksichtigt werden.</p>`,
    examples: [
      ["12:34 20", "12:14"],
      ["12:34 60", "11:34"],
      ["12:34 181", "09:33"],
    ],
  },
  {
    id: "vektoraddition",
    title: "Vektoraddition mit Struct",
    lead: `<p class="lead">Definieren Sie eine Struktur <code>vektor</code> mit den Integerattributen <code>x</code>, <code>y</code>, <code>z</code>. Schreiben Sie eine Funktion <code>vektor addVektor(const vektor * a, const vektor * b)</code>, die einen neuen Vektor als komponentenweise Summe der beiden übergebenen Vektoren erzeugt und zurückgibt:</p>`,
    extraDiagram: `(a)   (d)   (a+d)
(b) + (e) = (b+e)
(c)   (f)   (c+f)`,
    extra: note(`<code>addVektor({1,2,3}, {4,5,6})</code> &rarr; <code>{5,7,9}</code>.`),
  },
  {
    id: "vergroessern",
    title: "Array um zwei Elemente vergrößern",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>int * vergroessern(int * arr, int laenge_arr)</code>. Erster Befehl muss <code>printf("%s%d\\n", __func__, arr[1]);</code> sein. Die Funktion legt intern ein neues Array an, das zwei Einträge länger ist als <code>laenge_arr</code>, kopiert alle Werte aus <code>arr</code> hinein und belegt die zwei neuen Einträge mit <code>-1</code>. Das neue Array wird zurückgegeben.</p>`,
    extra: note(`<code>vergroessern({4,7,9}, 3)</code> &rarr; <code>{4,7,9,-1,-1}</code>.`),
  },
  {
    id: "zinsen",
    title: "Zinseszins über 10 Jahre",
    lead: `<p class="lead">Lesen Sie einen Geldbetrag und einen Zinssatz ein (als Dezimalwert, also 0.1 statt 10 %). Berechnen Sie, welchen Wert der Betrag nach 10 Jahren zu diesem Zinssatz hat, und geben Sie ihn aus, ohne erläuternden Text. Die Verzinsung für ein Jahr ergibt sich, indem der Betrag mit <code>(1 + Zins)</code> multipliziert wird &ndash; das Ergebnis ist die Grundlage für das nächste Jahr.</p>`,
    examples: [
      ["10 0", "10"],
      ["10 0.01", "11.0462"],
      ["10 0.1", "25.9374"],
    ],
  },
  {
    id: "maxpos",
    title: "Position des größten Arraywerts",
    lead: `<p class="lead">Schreiben Sie eine Funktion <code>int maxpos(int * arr, int len)</code>, die die Position des größten Werts im übergebenen Integer-Array zurückgibt. Erster Befehl der Funktion muss <code>printf("%s\\n", __func__);</code> sein.</p>`,
    extra: note(`<code>maxpos({4,1,2,8,9,1}, 6)</code> &rarr; <code>4</code>, da <code>9</code> an Position 4 steht.`),
    examples: [
      ["0", "maxpos 4"],
      ["3", "maxpos 1"],
      ["5", "maxpos 2"],
    ],
  },
];

function downloadBlock(ex) {
  const sourceFilename = ex.id + ".cpp";
  const packageFilename = ex.id + "-starterpaket.zip";
  return (
    '<div class="template-download"><a class="download-btn" href="content/starterpacks/' +
    packageFilename +
    '" download="' +
    packageFilename +
    '">⬇ Starterpaket herunterladen (ZIP)</a><a class="download-source-link" href="content/templates/' +
    sourceFilename +
    '" download="' +
    sourceFilename +
    '">Nur die C++-Datei</a><p class="download-hint">ZIP entpacken und <code>start.bat</code> (Windows) oder <code>start.sh</code> (macOS/Linux) starten. Bearbeitet werden muss nur der TODO-Block.</p></div>'
  );
}

function buildFragment(ex) {
  let html = ex.lead;

  if (ex.extraDiagram) {
    html += codeBlock({ label: "Beispiel", lang: null, code: ex.extraDiagram });
  }
  if (ex.leadAfterDiagram) {
    html += ex.leadAfterDiagram;
  }
  if (ex.extraVorgabe) {
    html += "<h4>Vorgabe</h4>" + codeBlock({ label: "C++ (Vorgabe)", lang: "cpp", code: ex.extraVorgabe });
  }
  if (ex.extra) {
    html += ex.extra;
  }
  if (ex.examples) {
    html += "<h4>Beispiele</h4>" + examplesTable(ex.examples);
  }

  html += downloadBlock(ex);
  html += "<h4>Lösung</h4>" + codeBlock({ label: "C++", lang: "cpp", code: readSolution(ex.id) });

  return html;
}

// --- Content-Fragmente + Übungsvorlagen schreiben ---
const templatesDirectory = path.join(contentDirectory, "templates");
const starterpacksDirectory = path.join(contentDirectory, "starterpacks");
fs.mkdirSync(templatesDirectory, { recursive: true });
fs.mkdirSync(starterpacksDirectory, { recursive: true });

const manifestEntries = EXERCISES.map((ex, index) => {
  const order = String(START_ORDER + index).padStart(2, "0");
  const filename = order + "_" + ex.id + ".html";
  fs.writeFileSync(path.join(contentDirectory, filename), buildFragment(ex), "utf8");
  fs.writeFileSync(path.join(templatesDirectory, ex.id + ".cpp"), templateFor(ex), "utf8");
  fs.writeFileSync(
    path.join(starterpacksDirectory, ex.id + "-starterpaket.zip"),
    createZip(starterPackageEntries(ex))
  );
  return { id: ex.id, group: GROUP, title: ex.title, file: filename };
});

// --- manifest.json ergänzen (idempotent: vorhandene Übungen-Einträge werden ersetzt) ---
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const withoutOldExercises = manifest.filter((entry) => entry.group !== GROUP);
const newManifest = withoutOldExercises.concat(manifestEntries);
fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2) + "\n", "utf8");

console.log("Erstellt: " + manifestEntries.length + " Übungs-Fragmente, Starterpakete + manifest.json aktualisiert");
