
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

// To Save during execution
// enableCore0WDT();
// disableCore0WDT();
// disableLoopWDT();

// #include <Arduino.h>
// #include "ArduinoJson.h"

// struct Config
// {
//   String ssidap;
//   String passwordap;
//   String ssid;
//   String password;
//   bool intervalMode;
//   int tmc_uart_rx;
//   int tmc_uart_tx;
//   bool access_point;
//   JsonVariant configJson;
//   JsonVariant profileJson;
// };

// Config config;

bool initSPIFFS()
{
    if (!SPIFFS.begin(true))
    {
        Serial.println("An Error has occurred while mounting SPIFFS");
        return false;
    }
    else
    {
        return true;
    }
}
void openProfile()
{

  String filename = config.configJson["profile"];
  String file = "/profiles/" + filename + ".json";
  Serial.print("Profile file to load: ");
  Serial.println(file);

  if (!SPIFFS.begin())
  {
    Serial.println("Failed to mount SPIFFS");
  }
  else
  {
    File profileFile = SPIFFS.open(file, FILE_READ);

    if (!profileFile)
    {
      Serial.println("There was an error opening the profile file");
      return;
    }

    else
    {
      Serial.println("Profile File opened!");
      size_t size = profileFile.size();
      if (size > 2048) //1024
      {
        Serial.print("Profile file size is too large: ");
        Serial.println(size);
      }
      else
      {

        DynamicJsonDocument doc(2048);
        DeserializationError error = deserializeJson(doc, profileFile);
        JsonVariant profileJson = doc.as<JsonVariant>();
        config.profileJson = profileJson;
        if (error)
        {
          Serial.println("Failed to parse profile file");
          displayJSONError(error);
        }
        else
        {
          String brand = doc["brand"];
          String description = doc["description"];
          Serial.println("Slider Model: " + brand + " " + description);

          //   "slider": {
          //     "include": true,
          //     "dir_pin": 27,
          //     "step_pin": 14,
          //     "enable_pin": 12,
          //     "encoder": false,
          //     "limit_switch": 13,
          //     "step_per_mm": 0,
          //     "always_enabled": true,
          //     "tmc_driver_address": "0b00"
          // },
          bool include = doc["motors"]["slider"]["include"];
          if (include)
          {
            slider_Motor.dir_pin = doc["motors"]["slider"]["dir_pin"];
            slider_Motor.step_pin = doc["motors"]["slider"]["step_pin"];
            slider_Motor.enable_pin = doc["motors"]["slider"]["enable_pin"];
            slider_Motor.encoder = doc["motors"]["slider"]["encoder"];
            slider_Motor.limit_switch = doc["motors"]["slider"]["limit_switch"];
            slider_Motor.step_per_mm = doc["motors"]["slider"]["step_per_mm"];
            slider_Motor.always_enabled = doc["motors"]["slider"]["always_enabled"];
            String tmc_driver_address = doc["motors"]["slider"]["tmc_driver_address"];
            slider_Motor.tmc_driver_address = tmc_driver_address;
          }
        }
        Serial.println("");
      }
    }

    profileFile.close();
  }
}
void readConfigFile()
{
  if (!SPIFFS.begin())
  {
    Serial.println("Failed to mount SPIFFS");
  }
  else
  {
    File configFile = SPIFFS.open("/config.json", FILE_READ);

    if (!configFile)
    {
      Serial.println("There was an error opening the config file");
      return;
    }

    else
    {
      Serial.println("Config File opened!");
      size_t size = configFile.size();
      if (size > 2048) //1024
      {
        Serial.print("Config file size is too large: ");
        Serial.println(size);
      }
      else
      {
        DynamicJsonDocument doc(2048);
        DeserializationError error = deserializeJson(doc, configFile);
        JsonVariant configJson = doc.as<JsonVariant>();
        config.configJson = configJson;
        if (error)
        {
          Serial.println("Failed to parse config file");
          displayJSONError(error);
        }
        else
        {
          String ssidap = doc["wifi"]["ssidap"];
          config.ssidap = ssidap;
          Serial.println();
          bool intervalMode = doc["interval-mode"];
          config.intervalMode = intervalMode;

          if (config.intervalMode) {
            config.cam1Trigger = 27;
            config.cam2Trigger = 26;
            config.slaveTrigger = 4;
          } else {
            int cam1Trigger = doc["camera_trigger"]["cam1_pin"];
            int cam2Trigger = doc["camera_trigger"]["cam2_pin"];
            int slaveTrigger = doc["camera_trigger"]["slave_pin"];

            config.cam1Trigger = cam1Trigger;
            config.cam2Trigger = cam2Trigger;
            config.slaveTrigger = slaveTrigger;
          }
          String passwordap = doc["wifi"]["passwordap"];
          config.passwordap = passwordap;
          String ssid = doc["wifi"]["ssid"];
          config.ssid = ssid;

          String password = doc["wifi"]["password"];
          config.password = password;
          String access_point = doc["wifi"]["access_point"];
          config.access_point = doc["wifi"]["access_point"];
          Serial.println("**********************************");
          if (config.access_point == true)
          {

            Serial.println("WIFI HOTSPOT MODE");
            Serial.println("SSID: " + (String)config.ssidap);
            Serial.println("SSID password: " + passwordap);
          }
          else
          {
            Serial.println("WIFI NETWORK CONNECTION MODE");
            Serial.println("Connected Router SSID: " + (String)config.ssid);
          }
          Serial.println("**********************************");
          int tmc_uart_rx = doc["tmc_uart_rx"];
          config.tmc_uart_rx = tmc_uart_rx;
          int tmc_uart_tx = doc["tmc_uart_tx"];
          config.tmc_uart_tx = tmc_uart_tx;
        }
        Serial.println("");
      }
    }

    configFile.close();
    openProfile();
  }
}

