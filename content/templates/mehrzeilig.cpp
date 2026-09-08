#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// Nur für diese Übung benötigte eval.h-Makros, direkt eingebunden, damit
// diese Datei allein (ohne separate eval.h) kompiliert:
#define _AKAD_INS1 string s1; std::getline(cin, s1);

void ausgabeMehrzeilig(const string &str)
{
    // TODO: Ihre Lösung hier
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INS1 ausgabeMehrzeilig(s1);
}

int main()
{
    eval();
    return 0;
}
