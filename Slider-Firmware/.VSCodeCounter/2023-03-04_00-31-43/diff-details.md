# Diff Details

Date : 2023-03-04 00:31:43

Directory d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\web-application

Total : 46 files,  1846 codes, 385 comments, 211 blanks, all 2442 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [Slider-Firmware/lib/slider/clock.h](/Slider-Firmware/lib/slider/clock.h) | C++ | -111 | -32 | -18 | -161 |
| [Slider-Firmware/lib/slider/commands/Commands.h](/Slider-Firmware/lib/slider/commands/Commands.h) | C++ | -178 | -14 | -18 | -210 |
| [Slider-Firmware/lib/slider/commands/JoystickCommand.h](/Slider-Firmware/lib/slider/commands/JoystickCommand.h) | C++ | -46 | -13 | -8 | -67 |
| [Slider-Firmware/lib/slider/definitions.h](/Slider-Firmware/lib/slider/definitions.h) | C++ | -4 | -14 | -2 | -20 |
| [Slider-Firmware/lib/slider/encoders.h](/Slider-Firmware/lib/slider/encoders.h) | C++ | -39 | -15 | -9 | -63 |
| [Slider-Firmware/lib/slider/includes.h](/Slider-Firmware/lib/slider/includes.h) | C++ | -10 | -49 | -20 | -79 |
| [Slider-Firmware/lib/slider/intervalometer.h](/Slider-Firmware/lib/slider/intervalometer.h) | C++ | -154 | -23 | -16 | -193 |
| [Slider-Firmware/lib/slider/motors.h](/Slider-Firmware/lib/slider/motors.h) | C++ | -160 | -20 | -25 | -205 |
| [Slider-Firmware/lib/slider/networking.h](/Slider-Firmware/lib/slider/networking.h) | C++ | -35 | -14 | -3 | -52 |
| [Slider-Firmware/lib/slider/serial_messages.h](/Slider-Firmware/lib/slider/serial_messages.h) | C++ | -36 | -13 | -7 | -56 |
| [Slider-Firmware/lib/slider/spiffs_files.h](/Slider-Firmware/lib/slider/spiffs_files.h) | C++ | -160 | -28 | -19 | -207 |
| [Slider-Firmware/lib/slider/stepper_driver.h](/Slider-Firmware/lib/slider/stepper_driver.h) | C++ | -12 | -16 | -3 | -31 |
| [Slider-Firmware/lib/slider/utils.h](/Slider-Firmware/lib/slider/utils.h) | C++ | -39 | -17 | -11 | -67 |
| [Slider-Firmware/lib/slider/variables.h](/Slider-Firmware/lib/slider/variables.h) | C++ | -21 | -15 | -10 | -46 |
| [Slider-Firmware/lib/slider/web_server.h](/Slider-Firmware/lib/slider/web_server.h) | C++ | -99 | -25 | -9 | -133 |
| [Slider-Firmware/lib/slider/websocket.h](/Slider-Firmware/lib/slider/websocket.h) | C++ | -152 | -21 | -16 | -189 |
| [Slider-Firmware/web-application/src/about.html](/Slider-Firmware/web-application/src/about.html) | HTML | 33 | 13 | 0 | 46 |
| [Slider-Firmware/web-application/src/css/bootstrap.min.css](/Slider-Firmware/web-application/src/css/bootstrap.min.css) | CSS | 2 | 5 | 0 | 7 |
| [Slider-Firmware/web-application/src/css/style.css](/Slider-Firmware/web-application/src/css/style.css) | CSS | 295 | 8 | 42 | 345 |
| [Slider-Firmware/web-application/src/index-interv.html](/Slider-Firmware/web-application/src/index-interv.html) | HTML | 64 | 61 | 20 | 145 |
| [Slider-Firmware/web-application/src/index.html](/Slider-Firmware/web-application/src/index.html) | HTML | 265 | 20 | 26 | 311 |
| [Slider-Firmware/web-application/src/index.js](/Slider-Firmware/web-application/src/index.js) | JavaScript | 9 | 35 | 11 | 55 |
| [Slider-Firmware/web-application/src/interval.html](/Slider-Firmware/web-application/src/interval.html) | HTML | 95 | 13 | 0 | 108 |
| [Slider-Firmware/web-application/src/interval.webmanifest](/Slider-Firmware/web-application/src/interval.webmanifest) | JSON | 32 | 0 | 0 | 32 |
| [Slider-Firmware/web-application/src/js/bootstrap.bundle.min.js](/Slider-Firmware/web-application/src/js/bootstrap.bundle.min.js) | JavaScript | 1 | 6 | 0 | 7 |
| [Slider-Firmware/web-application/src/js/chart.js](/Slider-Firmware/web-application/src/js/chart.js) | JavaScript | 2 | 12 | 0 | 14 |
| [Slider-Firmware/web-application/src/js/commands.js](/Slider-Firmware/web-application/src/js/commands.js) | JavaScript | 295 | 2 | 5 | 302 |
| [Slider-Firmware/web-application/src/js/helpers.js](/Slider-Firmware/web-application/src/js/helpers.js) | JavaScript | 2 | 7 | 0 | 9 |
| [Slider-Firmware/web-application/src/js/index.js](/Slider-Firmware/web-application/src/js/index.js) | JavaScript | 407 | 108 | 72 | 587 |
| [Slider-Firmware/web-application/src/js/interval.js](/Slider-Firmware/web-application/src/js/interval.js) | JavaScript | 0 | 0 | 1 | 1 |
| [Slider-Firmware/web-application/src/js/joystick.js](/Slider-Firmware/web-application/src/js/joystick.js) | JavaScript | 128 | 44 | 10 | 182 |
| [Slider-Firmware/web-application/src/js/jquery.min.js](/Slider-Firmware/web-application/src/js/jquery.min.js) | JavaScript | 1 | 1 | 0 | 2 |
| [Slider-Firmware/web-application/src/js/main.js](/Slider-Firmware/web-application/src/js/main.js) | JavaScript | 891 | 173 | 115 | 1,179 |
| [Slider-Firmware/web-application/src/js/not_edit.js](/Slider-Firmware/web-application/src/js/not_edit.js) | JavaScript | 0 | 7 | 28 | 35 |
| [Slider-Firmware/web-application/src/js/websocket.js](/Slider-Firmware/web-application/src/js/websocket.js) | JavaScript | 61 | 13 | 3 | 77 |
| [Slider-Firmware/web-application/src/serviceworker-i.js](/Slider-Firmware/web-application/src/serviceworker-i.js) | JavaScript | 57 | 24 | 6 | 87 |
| [Slider-Firmware/web-application/src/serviceworker.js](/Slider-Firmware/web-application/src/serviceworker.js) | JavaScript | 57 | 24 | 6 | 87 |
| [Slider-Firmware/web-application/src/settings.html](/Slider-Firmware/web-application/src/settings.html) | HTML | 22 | 13 | 0 | 35 |
| [Slider-Firmware/web-application/src/slider.webmanifest](/Slider-Firmware/web-application/src/slider.webmanifest) | JSON | 32 | 0 | 0 | 32 |
| [Slider-Firmware/web-application/src/templates/footer-template.html](/Slider-Firmware/web-application/src/templates/footer-template.html) | HTML | 2 | 0 | 1 | 3 |
| [Slider-Firmware/web-application/src/templates/index-interv-template.html](/Slider-Firmware/web-application/src/templates/index-interv-template.html) | HTML | 12 | 22 | 5 | 39 |
| [Slider-Firmware/web-application/src/templates/index-loc-inter-tmp.html](/Slider-Firmware/web-application/src/templates/index-loc-inter-tmp.html) | HTML | 20 | 20 | 6 | 46 |
| [Slider-Firmware/web-application/src/templates/index-loc-tmp.html](/Slider-Firmware/web-application/src/templates/index-loc-tmp.html) | HTML | 20 | 20 | 7 | 47 |
| [Slider-Firmware/web-application/src/templates/index-template.html](/Slider-Firmware/web-application/src/templates/index-template.html) | HTML | 12 | 22 | 6 | 40 |
| [Slider-Firmware/web-application/src/templates/interval-template.html](/Slider-Firmware/web-application/src/templates/interval-template.html) | HTML | 42 | 41 | 15 | 98 |
| [Slider-Firmware/web-application/src/templates/slider-template.html](/Slider-Firmware/web-application/src/templates/slider-template.html) | HTML | 243 | 0 | 20 | 263 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details