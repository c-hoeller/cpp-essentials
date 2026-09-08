#include <iostream>
#include <cmath>

void showInteractiveInputHint()
{
    std::cerr << "Testeingabe eingeben (siehe README oder Beispiele), dann Enter: " << std::flush;
}

using namespace std;

int main()
{
    showInteractiveInputHint();
    double number;
    cin >> number;

    // TODO: Sinus und Cosinus berechnen und ausgeben

    return 0;
}
