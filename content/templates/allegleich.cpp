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

bool allegleich(int* arr, int anzahl)
{
    printf("-%s-\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    int a1[20] = { 1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2 };
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5
     a1[i2] = i3; a1[i4] = i5;
    cout << (allegleich(a1, i1) ? "G" : "N") << endl;
}

int main()
{
    eval();
    return 0;
}
