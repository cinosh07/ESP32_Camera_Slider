const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./web-application/src/index.js",
  output: {
    path: path.resolve(__dirname, "data/www"),
    filename: "index.min.js",
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // {
      //   test: /\.html$/i,
      //   loader: "html-loader",
      // },
    ],
  },

  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "./web-application/src/index-temp.html",
    //   meta: {
    //     viewport:
    //       "width=device-width, initial-scale=1, shrink-to-fit=no, initial-scale=1",
    //     "Cache-Control": "no-cache, no-store, must-revalidate",
    //     Pragma: "no-cache",
    //     Expires: "0",
    //   },
    //   title: "Slider Controller",
    //   filename: "./index.html",
    //   favicon: "./web-application/src/favicon.ico",
    //   inject: "body",
    //   chunks: ['index'],
    // }),
    // new HtmlWebpackPlugin({
    //   title: "Intervalometer",
    //   filename: "./index-interv.html",
    //   favicon: "./web-application/src/favicon.ico",
    //   template: "./web-application/src/index-interv-template.html",
    //   meta: {
    //     viewport:
    //       "width=device-width, initial-scale=1, shrink-to-fit=no, initial-scale=1",
    //     "Cache-Control": "no-cache, no-store, must-revalidate",
    //     Pragma: "no-cache",
    //     Expires: "0",
    //   },
    // }),
    new CopyPlugin({
      patterns: [
        { from: "./web-application/src/about.html", to: "./about.html" },
        { from: "./web-application/src/interval.html", to: "./interval.html" },
        { from: "./web-application/src/settings.html", to: "./settings.html" },
        { from: "./web-application/src/serviceworker.js", to: "./serviceworker.js" },
        { from: "./web-application/src/serviceworker-i.js", to: "./serviceworker-i.js" },
        { from: "./web-application/src/slider.webmanifest", to: "./slider.webmanifest" },
        { from: "./web-application/src/interval.webmanifest", to: "./interval.webmanifest" },
        { from: "./web-application/src/favicon.ico", to: "./favicon.ico" },
        { from: "./web-application/src/images", to: "./images" },
        { from: "./web-application/src/license.txt", to: "./license.txt" },
        { from: "./web-application/src/css", to: "./css" },
      ],
    }),
  ],
};
