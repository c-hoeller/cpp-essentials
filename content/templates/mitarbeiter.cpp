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
#define _AKAD_INS1 string s1; std::getline(cin, s1);
#define _AKAD_INS2 string s2; std::getline(cin, s2);
#define _AKAD_INI1 int i1; std::cin >> i1;

class Mitarbeiter
{
    static int nummerManager;
    int pnr;
    string vorname;
    string nachname;

public:
    Mitarbeiter(string vname, string nname)
    {
        // TODO: Ihre Lösung hier (nummerManager erhöhen, pnr setzen, vorname/nachname übernehmen)
    }

public:
    int getPnr()
    {
        // TODO: Ihre Lösung hier
        return 0;
    }
};

int Mitarbeiter::nummerManager = 100;

// Die Methode eval darf nicht verändert werden
void eval()
{
    _AKAD_INS1 _AKAD_INS2 _AKAD_INI1 for (int i = 0; i < i1; i++)
    {
        Mitarbeiter *m = new Mitarbeiter(s1, s2);
        delete m;
    }
    Mitarbeiter m(s1, s2);
    cout << m.getPnr() << endl;
}

int main()
{
    showInteractiveInputHint();
    eval();
    return 0;
}
