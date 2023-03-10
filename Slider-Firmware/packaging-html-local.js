
const mergeFiles = require("merge-files");
const path = require('path');
const outputPathIndex = path.resolve(__dirname, "web-application/src/index.html")
 
const inputPathListIndex = [
    path.resolve(__dirname, "web-application/src/templates/index-loc-tmp.html"),
    path.resolve(__dirname, "web-application/src/templates/slider-template.html"),
    path.resolve(__dirname, "web-application/src/templates/footer-template.html")
];

const outputPathIndexInterval = path.resolve(__dirname, "web-application/src/index-interv.html")
 
const inputPathListIndexnterval = [
    path.resolve(__dirname, "web-application/src/templates/index-loc-inter-tmp.html"),
    path.resolve(__dirname, "web-application/src/templates/interval-template.html"),
    path.resolve(__dirname, "web-application/src/templates/footer-template.html")
];

function start() {
    try{  
        mergeFiles  (inputPathListIndex, outputPathIndex).then((status) => {
            console.log('Concat index file completed');
          });
          mergeFiles  (inputPathListIndexnterval, outputPathIndexInterval).then((status) => {
            console.log('Concat index-interv completed');
          });
    } catch(e) {
        console.error('Error concatenate files ', e);
    }
}
 
start();

