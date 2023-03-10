const mergeFiles = require("merge-files");
const path = require("path");
const outputPathIndex = path.resolve(__dirname, "data/www/index.html");

const inputPathListIndex = [
  path.resolve(__dirname, "web-application/src/templates/index-template.html"),
  path.resolve(__dirname, "web-application/src/templates/slider-template.html"),
  path.resolve(__dirname, "web-application/src/templates/footer-template.html"),
];

const outputPathIndexInterval = path.resolve(
  __dirname,
  "data/www/index-interv.html"
);

const inputPathListIndexnterval = [
  path.resolve(
    __dirname,
    "web-application/src/templates/index-interv-template.html"
  ),
  path.resolve(
    __dirname,
    "web-application/src/templates/interval-template.html"
  ),
  path.resolve(__dirname, "web-application/src/templates/footer-template.html"),
];

const outputPathMainJS = path.resolve(
  __dirname,
  "web-application/src/js/main.js"
);

const inputPathListMainsJS = [
  path.resolve(__dirname, "web-application/src/js/not_edit.js"),
  path.resolve(__dirname, "web-application/src/js/index.js"),
  path.resolve(__dirname, "web-application/src/js/commands.js"),
  path.resolve(__dirname, "web-application/src/js/joystick.js"),
  path.resolve(__dirname, "web-application/src/js/websocket.js"),
];

function start() {
  try {
    mergeFiles(inputPathListIndex, outputPathIndex).then((status) => {
      console.log("Concat index file completed");
      console.log("");
      console.log("Waiting for Webpack to complete its task ...");
    });
    mergeFiles(inputPathListMainsJS, outputPathMainJS).then((status) => {
      console.log("Concat js files completed");
      console.log("");
      console.log("Waiting for Webpack to complete its task ...");
    });
    mergeFiles(inputPathListIndexnterval, outputPathIndexInterval).then(
      (status) => {
        console.log("Concat index-interv completed");
        console.log("");
        console.log("Waiting for Webpack to complete its task ...");
      }
    );
  } catch (e) {
    console.error("Error concatenate files ", e);
  }
}

start();
