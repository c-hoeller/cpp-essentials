#include <iostream>
#include <cstdlib>
#include <string>
#include <cstring>

void showInteractiveInputHint()
{
    std::cerr << "Testeingabe eingeben (siehe README oder Beispiele), dann Enter: " << std::flush;
}

using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INS1 string s1; std::getline(cin, s1);

bool enthaelt_zahl(const char * str)
{
    printf("-%s-\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INS1 cout << (enthaelt_zahl(s1.c_str()) ? "E" : "N");
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
