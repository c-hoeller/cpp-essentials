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
#define _AKAD_INI1 int i1; std::cin >> i1;
#define _AKAD_INI2 int i2; std::cin >> i2;

void swap(int *a, int *b)
{
    // TODO: Ihre Lösung hier
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1 _AKAD_INI2 swap(&i1, &i2);
    cout << (i1 * 11 + i2 * 3) << endl;
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
