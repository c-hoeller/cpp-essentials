#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INI1 int i1; std::cin >> i1;
#define _AKAD_INI2 int i2; std::cin >> i2;
#define _AKAD_INI3 int i3; std::cin >> i3;
#define _AKAD_INI4 int i4; std::cin >> i4;
#define _AKAD_INI5 int i5; std::cin >> i5;

int copyDistinct(int *source, int *dest, int anzahl)
{
    // TODO: Ihre Lösung hier

    return 0;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    int a1[20];
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
    cout << a2[3] << a1[3] << a2[4] << a2[5] << endl;
}

int main()
{
    eval();
    return 0;
}
