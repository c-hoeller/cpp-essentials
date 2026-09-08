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
#define _AKAD_INI3 int i3; std::cin >> i3;
#define _AKAD_INI4 int i4; std::cin >> i4;
#define _AKAD_INI5 int i5; std::cin >> i5;

struct vektor
{
    int x;
    int y;
    int z;
};

vektor addVektor(const vektor *a, const vektor *b)
{
    // TODO: Ihre Lösung hier

    return vektor{};
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5
        vektor a{i1, i2, i3};
    vektor b{i1, i4, i5};
    vektor c = addVektor(&a, &b);
    cout << c.x + c.y + c.z;
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
