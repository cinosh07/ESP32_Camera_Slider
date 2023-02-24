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

    void displayInitMessage()
{
    Serial.println("");
    Serial.println("**********************************");
    Serial.println("**********************************");
    Serial.println("");
    Serial.println(" Cinosh Camera Slider Controller  ");
    Serial.println("           version 0.1            ");
    Serial.println("");
    Serial.println("   Copyright 2023 Carl Tremblay   ");
    Serial.println("");
    Serial.println("**********************************");
    Serial.println("**********************************");
    Serial.println("");
    Serial.print("Slider Init ...");
}

void displayEncoderReadyMessage(int b) {
    Serial.println("**********************************");
  Serial.println("");
  Serial.print("AS5600 Encoder Connected: ");
  Serial.println(b);
  Serial.println("");
}


void sendControllerReadyMessage() {
    Serial.println("");
    Serial.println("**********************************");
    Serial.println("Slider controller ready!");
    Serial.println("**********************************");
    Serial.println("");
}

void sendWebsocketReadyMessage() {
    Serial.println("");
    Serial.println("Websocket client connection received");
    Serial.println("");
    
}