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

int *vergroessern(int *arr, int laenge_arr)
{
    printf("%s%d\n", __func__, arr[1]);

    // TODO: Ihre Lösung hier

    // Neutrales, aber gültiges Ergebnis, damit das Testgerüst mit
    // simulierter Eingabe nicht abstürzt, bevor die Lösung ergänzt ist.
    return new int[laenge_arr + 2]{};
}

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INI1 _AKAD_INI2 _AKAD_INI3 _AKAD_INI4 int a[] = {2, 6, 7, 8, 9, 2, 4, 5};
    a[i1] = i2;
    int *c = vergroessern(a, i3);
    cout << c[i4];
    cout << endl;
    delete[] c;
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
