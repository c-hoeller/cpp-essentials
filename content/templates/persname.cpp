#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

struct pers
{
    string vname;
    string nname;
};

void eval(pers * p)
{
   cout << __func__<< p->nname << p->vname;
}

int main()
{
    // TODO: Ihre Lösung hier (Variable vom Typ pers anlegen, Vor-/Nachname einlesen, eval(&variable) aufrufen)

    return 0;
}
