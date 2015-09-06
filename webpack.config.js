module.exports = {
    entry: "./src/edge.js",
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