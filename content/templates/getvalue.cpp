#include <stdio.h>
#include <iostream>
using namespace std;

int get_value(const int * arr, int pos)
{
    printf("%s\n", __func__);

    // TODO: Ihre Lösung hier

    return 0;
}

int main()
{
    int pos;
    int a [] = {5,7,32,5,7,3,5,7};
    cin >> pos;
    cout << get_value (a,pos) << endl;
    return 0;
}
