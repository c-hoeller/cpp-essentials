#include <iostream>
#include <cstdlib>
#include <string>
#include <cstring>
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INS1 string s1; std::getline(cin, s1);

bool ist_palindron(const char *str)
{
    printf("-%s-\n", __func__);

    // TODO: Ihre Lösung hier

    return false;
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INS1 cout << (ist_palindron(s1.c_str()) ? "P" : "K");
}

int main()
{
    eval();
    return 0;
}
