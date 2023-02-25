/**********************************************************************
 *               Author: Carl Tremblay
 *
 *                Cinosh Camera Slider Controller
 *                        version 0.1
 *
 *                  Copyright 2023 Carl Tremblay
 *
 *                            License
 *     Attribution-NonCommercial-NoDerivatives 4.0 International
 *                      (CC BY-NC-ND 4.0)
 *        https://creativecommons.org/licenses/by-nc-nd/4.0/
 * 
 *********************************************************************/
// To debug web application without uploading to ESP32 SPIFFS we need to put the app in debug mode.
// and having http-server node js application. 
//
// Check main.js file for more details

// To package the files type this command in the console.

// npm run webpack

// For the following to work you need to change to fit the absolute path of the files in package.json

// Here's an example

// "scripts": {
//     "webpack": "webpack",
//     "server": "http-server D:/Timelapse_Slider/ESP32_Camera_Slider/Slider-Firmware/data/www",
//     "dev-server": "http-server D:/Timelapse_Slider/ESP32_Camera_Slider/Slider-Firmware/web-application/src"
//   },

// To test the compiled package localy - modify package.json to fit the absolute path of the files.

// npm run server

// To debug the application - modify package.json to fit the absolute path of the files.

// npm run dev-server

window.bootstrap = require("bootstrap/dist/js/bootstrap.bundle.js");
import $ from "jquery";
import jQuery from "jquery";
import Chart from "chart.js/auto";
window.jQuery = jQuery;
window.Chart = Chart;
window.$ = $;
require('./js/main.js');

$("#intervalometer").load("interval.html");