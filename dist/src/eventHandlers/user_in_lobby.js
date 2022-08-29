"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInLobbyHandler = void 0;
const roomModel_1 = require("../db/models/roomModel");
const user_joins_room_1 = require("./user_joins_room");
function userInLobbyHandler(io, socket, user) {
    socket.on("in_lobby", async () => {
        if (user?.currentRoom) {
            const room = await roomModel_1.Room.findOne({ _id: user?.currentRoom });
            console.log(room.name);
            socket.emit("userReturned", room.name);
        }
        (0, user_joins_room_1.joinRoomHandler)(io, socket, user);
    });
}
exports.userInLobbyHandler = userInLobbyHandler;
