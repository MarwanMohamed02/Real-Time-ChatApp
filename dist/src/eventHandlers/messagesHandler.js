"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesHandler = void 0;
const messages_1 = require("../utils/messages");
const bad_words_1 = __importDefault(require("bad-words"));
function messagesHandler(io, socket, room, username) {
    socket.emit("loadMessages", room.messages);
    socket.broadcast.to(room.name).emit("message", (0, messages_1.genMessage)(`${username} has joined the room!`));
    // Greeting new user only
    socket.emit("message", (0, messages_1.genMessage)("Welcome User!", "Admin"));
    // Sending a new message to everyone
    socket.on("sendMessage", (msg, ack) => {
        const filter = new bad_words_1.default();
        if (filter.isProfane(msg)) {
            return ack("Profanity is not allowed");
        }
        const message = (0, messages_1.genMessage)(msg, username);
        room.addMessage(message);
        io.to(room.name).emit("message", message);
        ack("Message sent!");
    });
    // Sending location to everyone
    socket.on("sendLocation", ({ latitude, longitude }, ack) => {
        const locationMessage = (0, messages_1.genMessage)(`https://google.com/maps?q=${latitude},${longitude}`, username);
        io.to(room.name).emit("sendLocationMessage", locationMessage);
        room.addMessage(locationMessage);
        ack("Location was shared successfully!");
    });
}
exports.messagesHandler = messagesHandler;
