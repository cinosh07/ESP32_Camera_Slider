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
#include "./commands/Commands.h"
#include "utils.h"
#include "motors.h"
#include "websocket.h"
#include "SPIFFS.h"
#include "spiffs_files.h"

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

// handles uploads
void handleUploadIntervProfiles(AsyncWebServerRequest *request)
{

  int params = request->params();
  if (request->hasParam("body", true))
  {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, request->getParam("body", true)->value());
    if (error)
    {
      Serial.println("Failed to parse intervalometer profiles file: Error invalid json file");
      request->send(200, "text/plain", "Error invalid json file\n");
    }
    else
    {
      // Write the file
      File file = SPIFFS.open("/profiles/interval.json", "w");
      serializeJson(doc, file);
      file.close();
      Serial.println("Success processing intervalometer profiles file");
      request->send(200, "text/plain", request->getParam("body", true)->value());
    }
  }
  else
  {
    request->send(200, "text/plain", "Error no Data\n");
  }
}

void handleUploadProfile(AsyncWebServerRequest *request)
{
  int params = request->params();
  if (request->hasParam("body", true))
  {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, request->getParam("body", true)->value());
    if (error)
    {
      Serial.println("Failed to parse config file: Error invalid json file");
      request->send(200, "text/plain", "Error invalid json file\n");
    }
    else
    {
      // Write the file
      String name = doc["name"];
      File file = SPIFFS.open("/" + name + ".json", "w");
      serializeJson(doc, file);
      file.close();
      Serial.println("Success processing config file");
      request->send(200, "text/plain", request->getParam("body", true)->value());
      String message = "Reboot! New Profile";
      rebootESP(message);
    }
  }
  else
  {
    request->send(200, "text/plain", "Error no Data\n");
  }
}
void handleUploadConfig(AsyncWebServerRequest *request)
{

  int params = request->params();
  if (request->hasParam("body", true))
  {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, request->getParam("body", true)->value());
    if (error)
    {
      Serial.println("Failed to parse config file: Error invalid json file");
      request->send(200, "text/plain", "Error invalid json file\n");
    }
    else
    {
      // Write the file
      File file = SPIFFS.open("/config.json", "w");
      serializeJson(doc, file);
      file.close();
      Serial.println("Success processing config file");
      request->send(200, "text/plain", request->getParam("body", true)->value());
      String message = "Reboot! New Config";
      rebootESP(message);
    }
  }
  else
  {
    request->send(200, "text/plain", "Error no Data\n");
  }
}
void handleUploadFirmware(AsyncWebServerRequest *request)
{
  // TODO upload and install new firmware.
  String message = "Reboot! New Firmware";
  request->send(200, "text/plain", message + "\n");
  rebootESP(message);
}
void handleUploadServerData(AsyncWebServerRequest *request)
{
  // TODO upload and install new server data.
  String message = "Reboot! New Server Data";
  request->send(200, "text/plain", message + "\n");
  rebootESP(message);
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
  server.on("/images/icon-144.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-144.png", "image/png"); });
  server.on("/images/icon-512.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-512.png", "image/png"); });
  server.on("/images/splash.jpg", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/splash.jpg", "image/jpeg"); });
  // License
  server.on("/index.min.js.LICENSE.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  server.on("/license.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  server.on("/LICENSE.txt", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/license.txt", "text/text"); });
  // Manifest
  server.on("/slider.webmanifest", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/slider.webmanifest", "text/json"); });
  server.on("/interval.webmanifest", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/interval.webmanifest", "text/json"); });
  // Services worker
  server.on("/serviceworker.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/serviceworker.js", "text/javascript"); });
  server.on("/serviceworker-i.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/serviceworker-i.js", "text/javascript"); });
  // Config and profiles
  server.on("/config", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/config.json", "text/json"); });
  server.on("/profile-1", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/profile-1.json", "text/json"); });
  server.on("/profile-2", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/profile-2.json", "text/json"); });
  server.on("/profile-3", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/profile-3.json", "text/json"); });
  server.on("/profile-4", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/profile-4.json", "text/json"); });
  server.on("/profile-5", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/profile-5.json", "text/json"); });
  server.on("/intervalometer", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/profiles/interval.json", "text/json"); });
  // handle Upload functions
  server.on(
      "/uploadIntervProfiles", HTTP_POST, [](AsyncWebServerRequest *request)
      { handleUploadIntervProfiles(request); });
  server.on(
      "/uploadProfile", HTTP_POST, [](AsyncWebServerRequest *request)
      { handleUploadProfile(request); });
  server.on(
      "/uploadConfig", HTTP_POST, [](AsyncWebServerRequest *request)
      { handleUploadConfig(request); });
  server.on(
      "/uploadFirmware", HTTP_POST, [](AsyncWebServerRequest *request)
      { handleUploadFirmware(request); });
  server.on(
      "/uploadServerData", HTTP_POST, [](AsyncWebServerRequest *request)
      { handleUploadServerData(request); });
  server.onNotFound(notFound);
  server.addHandler(&ws);
  server.begin();
}
