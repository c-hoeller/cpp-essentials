#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INI1 int i1; std::cin >> i1;

int qsumme(int number)
{
    printf("%s\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1
    cout << qsumme(i1) << endl;
}

int main()
{
    eval();
    return 0;
}
