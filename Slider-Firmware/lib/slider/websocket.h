/**********************************************************************
 *                  Author: Carl Tremblay
 *
 *                Cinosh Camera Slider Controller
 *                        version 0.1
 *
 *                  Copyright 2023 Carl Tremblay
 *
 *                            License
 *    Attribution-NonCommercial-NoDerivatives 4.0 International
 *                      (CC BY-NC-ND 4.0)
 *        https://creativecommons.org/licenses/by-nc-nd/4.0/
 *********************************************************************/

#include <Arduino.h>

AsyncWebSocket ws("/ws");
AsyncWebSocketClient *globalClient = NULL;

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == len)
  {
    switch (info->opcode)
    {
    case WS_TEXT:
      String data_str;
      data[len] = 0;
      for (size_t i = 0; i < len; i++)
      {
        data_str = String((char *)data);
      }
      data_str.trim();
      StaticJsonDocument<1024> command;
      DeserializationError error = deserializeJson(command, data_str);
      if (error)
      {
        displayJSONError(error);
      }
      else
      {
        processJSONCommand(command);
      }
      break;
    }
  }
}
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{

  if (type == WS_EVT_CONNECT)
  {
    sendWebsocketReadyMessage();
    client->text("{\"COMMAND_STATUS\":" + (String)commandStatus + ", \"INTERVALOMETER_MODE\":"+config.intervalMode+"}");
    globalClient = client;
  }
  else if (type == WS_EVT_DISCONNECT)
  {
    Serial.println("Client disconnected");
    globalClient = NULL;
  }
  else if (type == WS_EVT_DATA)
  {
    handleWebSocketMessage(arg, data, len);
  }
  else if (type == WS_EVT_ERROR)
  {
    Serial.println("Websocket Error !!!!!!!!!!!!!!!!!!!!!!!!!");
  }
}
void initWebsocket()
{
  ws.onEvent(onWsEvent);
}
