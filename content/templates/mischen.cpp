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

int *mischen(int *arr1, int *arr2, int laenge_arr)
{
    // TODO: Ihre Lösung hier

    return nullptr;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 _AKAD_INI5 int a[] = {2, 6, 7, 8, 9, 2, 4, 5};
    int b[] = {3, 7, 6, 3, 5, 6, 8, 2};
    a[i1] = i2;
    b[i3] = i4;
    int *c = mischen(a, b, i5);
    for (int i = 0; i < 2 * i5; i++)
        cout << c[i];
    cout << endl;
    delete[] c;
}

int main()
{
    eval();
    return 0;
}
