"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInLobbyHandler = void 0;
const roomModel_1 = require("../db/models/roomModel");
const createRoomHandler_1 = require("./createRoomHandler");
const joinRoomHandler_1 = require("./joinRoomHandler");
function userInLobbyHandler(io, socket, user) {
    socket.on("user_in_lobby", async () => {
        if (user.currentRoom) {
            try {
                const room = await roomModel_1.Room.findOne({ _id: user.currentRoom });
                socket.emit("user_returned", room);
            }
            catch (err) {
                socket.emit("db_error");
            }
        }
        (0, joinRoomHandler_1.joinRoomHandler)(io, socket, user);
        try {
            socket.emit("showActiveRooms", await roomModel_1.Room.getActiveRooms());
        }
        catch (err) {
            socket.emit("db_error");
        }
        (0, createRoomHandler_1.createRoomHandler)(io, socket, user);
    });
}
exports.userInLobbyHandler = userInLobbyHandler;
