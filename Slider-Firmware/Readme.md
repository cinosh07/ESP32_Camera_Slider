ESP32 - Video / Timelapse Camera Slider Controller

ESP32 Camera Slider Controller is a universal video / timelapse slider control system compatible with virtually any camera sliders. It is designed by Carl Tremblay (aka Cinosh07) with astrophotography timelapse and video production in mind.

The interface is accessed by connecting to the ESP32 hotspot and the interface is accessed via the phone's web browser.

I mounted the server service in asynchronous mode. So server requests do not influence the performance of the loop() in the code. I also included a websocket service which provides a real-time connection between the ESP32 and the web interface.
It allows you to control the slider as if the phone became a remote control physically connected to the slider. Without any latency.

The controller will also be compatible with commercial sliders. Including those of Dynamic Perception (Bankrupt) and whose controllers no longer work with recent versions of Android.

This is a work in progress.

To follow the project check my youtube channel https://youtube.com/@carltremblay

![Home Page](https://github.com/cinosh07/ESP32_Camera_Slider/raw/main/screenshots/home.png)