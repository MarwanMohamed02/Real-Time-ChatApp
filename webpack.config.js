const path = require("path")

module.exports = {
    entry: {
        index: "./public/client_side/index.ts",
        chat: "./public/client_side/chat.ts",
        createAccount: "./public/client_side/createAccount.ts",
    },
    output: {
        filename: "[name].js",
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