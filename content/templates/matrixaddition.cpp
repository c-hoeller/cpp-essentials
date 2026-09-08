#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    int a[5][5] = { { 1,2,3,4,5 }, {2,7,5,3,4}, {5,4,3,2,1}, {7,7,7,7,7}, {3,6,3,6,3} };
    int b[5];
    // **********************************
    // *** Ende der Programmvorgaben ****
    // Schreiben Sie hier Ihren Code

    // TODO: Ihre Lösung hier

    // **********************************
    // Der nachfolgende Code dient der Evaluation
    // und darf nicht verändert werden.
    int x1, x2;
    cin >> x1; cin >> x2;
    for (int i = x1; i <= x2; i++) {
         cout << b[i] << endl;
    }
    return 0;
}
