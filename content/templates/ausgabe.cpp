#include <iostream>
#include <cstdio>
using namespace std;

void ausgabe(const int *p)
{
    printf("%s\n", __func__);

    // TODO: Ihre Lösung hier
}

int main()
{
    int arr[20];

    for (int i = 0; i < 20; i++)
    {
        cin >> arr[i];
        if (arr[i] == -1) break;
    }

    ausgabe(arr);

    return 0;
}
