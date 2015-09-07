module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "build/polymation.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};