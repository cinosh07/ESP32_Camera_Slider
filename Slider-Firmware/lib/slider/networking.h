
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
#include <ESPmDNS.h>
#include <WiFi.h>

void initNetwork() {
    // ACCESS_POINT
  String hostname = "slider";
  WiFi.setHostname(hostname.c_str());
  if (config.access_point == true)
  {
    Serial.println("Setting Slider AP (Access Point) : ");
    Serial.println(config.access_point);
    WiFi.softAP((char *)config.ssidap.c_str(), (char *)config.passwordap.c_str());
    IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP);
  }
  else
  {
    Serial.println("**********************************");
    Serial.println("Setting Camera Slider Wifi Connection...");
    WiFi.begin((char *)config.ssid.c_str(), (char *)config.password.c_str());
    if (WiFi.waitForConnectResult() != WL_CONNECTED)
    {
      Serial.printf("WiFi Failed!\n");
      return;
    }
    IP = WiFi.localIP();
    Serial.print("Local IP address: ");
    Serial.println(IP);
  }
  if (!MDNS.begin("slider"))
  {
    Serial.println("Error starting mDNS");
    return;
  }
}