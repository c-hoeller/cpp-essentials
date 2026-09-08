#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INI1 int i1; std::cin >> i1;

int maxpos(int *arr, int len)
{
    printf("%s\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1
    int ia[10] = { 4,1,2,8,9,1,3,9,2,4 };
    cout << maxpos(&(ia[i1]), 10 - i1) << endl;
}

int main()
{
    eval();
    return 0;
}
