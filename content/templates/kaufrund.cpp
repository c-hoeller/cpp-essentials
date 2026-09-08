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
#define _AKAD_IND1 double d1; std::cin >> d1;

double kaufrund(double number)
{
    printf("-%s-\n", __func__);

    // TODO: Ihre Lösung hier

    return 0.0;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_IND1 cout << kaufrund(d1) << endl;
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
