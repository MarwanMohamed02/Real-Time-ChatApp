const path = require("path")

module.exports = {
    entry: "./public/client_side/chat.ts",
    output: {
        filename: "chat.js",
        path: path.join(__dirname, "dist/public/client_side")
    },
    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                use: [
                    "ts-loader"
                ]
            }
        ]
    }
}