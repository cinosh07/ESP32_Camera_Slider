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
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "websocket.h"
#include "SPIFFS.h"

// Set web server port number to 80
AsyncWebServer server(80);

String ipToString(const IPAddress &address)
{
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
};

String processor(const String &var)
{
  if (var == "STATE")
  {
    return "0";
  }
  if (var == "IP")
  {
    return ipToString(IP);
  }
  return String();
}

void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}

void initServer()
{
  // HTML Files
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index.html", String(), false, processor); });
  // TODO Swtich to this index page if firmware is in intervalometer mode -> "interval-mode" : true in config.json,
  //  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
  //            { request->send(SPIFFS, "/www/index-interv.html", String(), false, processor); });
  server.on("/index.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index.html", String(), false, processor); });
  server.on("/index-interv.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index-interv.html", String(), false, processor); });
  server.on("/interval.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/interval.html", String(), false, processor); });
  server.on("/about.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/about.html", String(), false, processor); });
  server.on("/settings.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/settings.html", String(), false, processor); });
  // CSS Files
  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/style.css", "text/css"); });
  server.on("/css/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/bootstrap.min.css", "text/css"); });
  // Javascript Files
  server.on("/index.min.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index.min.js", "text/javascript"); });
  // Image Files
  server.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/favicon.ico", "image/x-icon"); });
  server.on("/images/joystick-red.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-red.png", "image/png"); });
  server.on("/images/joystick-blue.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-blue.png", "image/png"); });
  server.on("/images/joystick-base.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-base.png", "image/png"); });
  server.on("/images/icon-64.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-64.png", "image/png"); });
  server.on("/images/icon-32.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-32.png", "image/png"); });
  server.on("/images/splash.jpg", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/splash.jpg", "image/jpeg"); });
  // License
  server.on("/index.min.js.LICENSE.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  server.on("/license.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  server.on("/LICENSE.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  server.onNotFound(notFound);
  server.addHandler(&ws);
  server.begin();
}
