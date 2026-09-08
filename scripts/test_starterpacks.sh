#!/usr/bin/env bash
# Prüft die ZIP-Starterpakete als vollständigen Downloadweg: Archivintegrität,
# enthaltene Dateien sowie Entpacken, Kompilieren und Starten einer Vorlage.
set -euo pipefail

root_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
packages_dir="$root_dir/content/starterpacks"
test_dir=$(mktemp -d "${TMPDIR:-/tmp}/cpp-tutorium-starterpacks.XXXXXX")
trap 'rm -rf -- "$test_dir"' EXIT

count=0
for archive in "$packages_dir"/*-starterpaket.zip; do
  unzip -tq "$archive" >/dev/null
  [[ $(unzip -Z1 "$archive" | wc -l | tr -d ' ') -eq 5 ]]
  ((++count))
done

unzip -q "$packages_dir/allegleich-starterpaket.zip" -d "$test_dir"
cmp "$test_dir/allegleich/allegleich.cpp" "$root_dir/content/templates/allegleich.cpp"
printf '10 1 1 2 1\n' | bash "$test_dir/allegleich/start.sh" >/dev/null 2>"$test_dir/stderr.txt"
rg -q 'Testeingabe eingeben \(siehe README oder Beispiele\)' "$test_dir/stderr.txt"
rg -q 'g\+\+.*allegleich\.cpp' "$test_dir/allegleich/start.bat"

echo "$count Starterpakete sind vollständig und der allegleich-Startweg funktioniert."
