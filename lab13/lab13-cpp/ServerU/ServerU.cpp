#include <iostream>
#include <clocale>
#include <ctime>

#include "ErrorMsgText.h"
#include "Winsock2.h"
using namespace std;

#pragma warning(disable : 4996)
#pragma comment(lib, "WS2_32.lib")  

int main()
{
    setlocale(LC_ALL, "rus");

    WSADATA wsaData;

    SOCKET  sS;
    SOCKADDR_IN serv;

    serv.sin_family = AF_INET;
    serv.sin_port = htons(3000);
    serv.sin_addr.s_addr = INADDR_ANY;

    try 
    {

        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) 
        {
            throw  SetErrorMsgText("WSAStartup: ", WSAGetLastError());
        }

        if ((sS = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) == INVALID_SOCKET)
        {
            throw  SetErrorMsgText("socket: ", WSAGetLastError());
        }
        if (bind(sS, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR) 
        {
            throw  SetErrorMsgText("bind: ", WSAGetLastError());
        }

        SOCKADDR_IN clientInfo;
        memset(&clientInfo, 0, sizeof(clientInfo));
        char ibuf[500];
        int lc = sizeof(clientInfo), lb = 0, lobuf = 0, libuf = 0;
        bool flag = true;

        if ((lb = recvfrom(sS, ibuf, sizeof(ibuf), NULL, (sockaddr*)&clientInfo, &lc)) == SOCKET_ERROR)
        {
            throw  SetErrorMsgText("recvfrom: ", WSAGetLastError());
        }

        cout << ibuf << endl;

        string obuf = "ECHO: " + string(ibuf) + '\0';

        if ((libuf = sendto(sS, obuf.c_str(), obuf.length() + 1, NULL, (SOCKADDR*)&clientInfo, lc)) == SOCKET_ERROR)
            throw  SetErrorMsgText("sendto: ", WSAGetLastError());

    }
    catch (basic_string<char> error_msg_text) 
    {
        cout << endl << error_msg_text;
    }

    system("pause");
    return 0;
}