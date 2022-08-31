"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginHandler = void 0;
const userModel_1 = require("../db/models/userModel");
function userLoginHandler(io, socket) {
    socket.on("login", async ({ username }) => {
        try {
            const user = await userModel_1.User.findOne({ username });
            if (!user) {
                return socket.emit("notFound");
            }
            else if (user.token !== undefined) {
                return socket.emit("already_logged_in");
            }
            const token = await user.genToken();
            socket.emit("found", { token, username, _id: user._id.toString() });
        }
        catch (err) {
            io.emit("db_error");
        }
    });
}
exports.userLoginHandler = userLoginHandler;
