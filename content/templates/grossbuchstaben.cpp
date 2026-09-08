#include <iostream>
#include <cstdlib>
#include <string>

void showInteractiveInputHint()
{
    std::cerr << "Testeingabe eingeben (siehe README oder Beispiele), dann Enter: " << std::flush;
}

using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INS1 string s1; std::getline(cin, s1);

int anzahlGrossbuchstaben(const string &str)
{
    // TODO: Ihre Lösung hier

    return 0;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INS1 cout << "eval:" << ((anzahlGrossbuchstaben(s1) == 0) ? 'N' : anzahlGrossbuchstaben(s1));
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
