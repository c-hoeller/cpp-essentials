#!/usr/bin/env bash
# Kompiliert alle Übungsvorlagen und führt jedes Testgerüst mit einer
# repräsentativen, über stdin simulierten Eingabe unter Address-/UB-Sanitizern
# aus. Die Vorlagen enthalten absichtlich TODOs; geprüft werden daher
# Kompilierbarkeit, Eingabepfade und sichere Ausführung, nicht die Lösung.
set -euo pipefail

root_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
templates_dir="$root_dir/content/templates"
build_dir=$(mktemp -d "${TMPDIR:-/tmp}/cpp-tutorium-templates.XXXXXX")
trap 'rm -rf -- "$build_dir"' EXIT

compiler=${CXX:-c++}
compile_flags=(-std=c++20 -Wall -Wextra -Wpedantic -Wno-unused-parameter -fsanitize=address,undefined)

input_for() {
  case "$1" in
    allegleich) printf '%s' '10 1 1 2 1' ;;
    arraysumme) printf '%s' '0' ;;
    asciicode) printf '%s' '66' ;;
    ausgabe) printf '%s' '1 2 -1' ;;
    copydistinct) printf '%s' '15 20 21 22 23' ;;
    enthaeltzahl) printf '%s' '2' ;;
    getvalue) printf '%s' '4' ;;
    grossbuchstaben) printf '%s' 'Hildegunst Mythenmetz' ;;
    istquadratzahl) printf '%s' '9' ;;
    kaufrund) printf '%s' '1.145' ;;
    kiste) printf '%s' '1 2 3 1 2 3' ;;
    matrixaddition) printf '%s' '1 2' ;;
    matrixwert) printf '%s' '2 2' ;;
    maxpos) printf '%s' '0' ;;
    median) printf '%s' '1 3 2' ;;
    mehrzeilig) printf '%s' 'Gregory.Peck' ;;
    mischen) printf '%s' '0 2 0 3 3' ;;
    mitarbeiter) printf 'Gregory\nPeck\n5' ;;
    palindron) printf '%s' 'hannah' ;;
    persname) printf '%s' 'Max Mustermann' ;;
    potenz) printf '%s' '2 5' ;;
    qsumme) printf '%s' '5' ;;
    restsubtraktion) printf '%s' '5 7' ;;
    reversefind) printf '%s' '15 4' ;;
    sekunden) printf '%s' '45' ;;
    sincos) printf '%s' '0.0' ;;
    swap) printf '%s' '2 5' ;;
    uhrzeitminus) printf '%s' '12:34 20' ;;
    vektoraddition) printf '%s' '4 2 3 1 2' ;;
    vergroessern) printf '%s' '1 2 4 5' ;;
    zinsen) printf '%s' '10 0' ;;
    *) return 1 ;;
  esac
}

count=0
for template in "$templates_dir"/*.cpp; do
  name=$(basename "${template%.cpp}")
  if ! input=$(input_for "$name"); then
    echo "Keine Testeingabe für $name definiert." >&2
    exit 1
  fi

  "$compiler" "${compile_flags[@]}" "$template" -o "$build_dir/$name"
  printf '%s\n' "$input" | "$build_dir/$name" >/dev/null
  ((++count))
done

echo "$count Vorlagen kompiliert und mit simulierter Eingabe sicher ausgeführt."
