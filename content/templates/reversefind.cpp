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

int reverseFind(long feld[], int len, long suchwert)
{
    printf("-%s-\n", __func__);

    // TODO: Ihre Lösung hier

    return -1;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1 _AKAD_INI2 long a[23] = {2, 6, 8, 9, 2, 4, 6, 8, 1, 2, 6, 3, 8, 6, 3, 6, 8, 9, 2, 3, 6, 2, 3};
    cout << reverseFind(a, i1, i2);
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
