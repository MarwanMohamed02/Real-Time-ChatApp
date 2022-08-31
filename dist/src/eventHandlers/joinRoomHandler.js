"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoomHandler = void 0;
const roomModel_1 = require("../db/models/roomModel");
const userModel_1 = require("../db/models/userModel");
const messages_1 = require("../utils/messages");
const messagesHandler_1 = require("./messagesHandler");
const roomDataHandler_1 = require("./roomDataHandler");
function joinRoomHandler(io, socket, user) {
    socket.on("joinRoom", async ({ roomName, username }) => {
        try {
            let room = await roomModel_1.Room.findOne({ name: roomName });
            if (!room) {
                return socket.emit("room_not_found");
            }
            if (!user.currentRoom || !(user.currentRoom?.toString() === room._id.toString())) {
                socket.broadcast.to(room.name).emit("message", (0, messages_1.genMessage)(`${username} has joined the room!`));
            }
            user.currentRoom = room._id;
            await user.save();
            socket.join(room.name);
            socket.emit("user_joined_room", room.name);
            (0, messagesHandler_1.messagesHandler)(io, socket, room, user);
            (0, roomDataHandler_1.roomDataHandler)(io, socket, room);
            // Alerting users that someone has left
            socket.on("leaveRoom", async () => {
                if (user) {
                    user.currentRoom = undefined;
                    await user.save();
                }
                socket.leave(room.name);
                io.to(room.name).emit("message", (0, messages_1.genMessage)(`${username} has left the room :(`));
                await room.populate("users");
                io.to(room.name).emit("showRoomers", room.toObject().users);
            });
        }
        catch (err) {
            socket.emit("db_error");
        }
    });
    // Logout
    socket.on("logout", async (token) => {
        try {
            const user = await userModel_1.User.findOne({ token });
            if (user) {
                await user.logOut();
                socket.emit("loggedOut");
            }
        }
        catch (err) {
            socket.emit("db_error");
        }
    });
}
exports.joinRoomHandler = joinRoomHandler;
