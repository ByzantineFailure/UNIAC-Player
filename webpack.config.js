const path = require("path"),
    CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'src', 'web', 'index.tsx'),
    output: {
        path: path.join(__dirname, 'dist', 'web'),
        filename: 'index.js'
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    devServer: {
        inline: true,
        port: 7777,
        host: "0.0.0.0"
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader"}
        ]
    },
    plugins: [
        new CopyPlugin([{
            from: path.join(__dirname, 'src', 'web', 'index.html'),
            to: path.join(__dirname, 'dist', 'web', 'index.html')
        }]),
    ]
};