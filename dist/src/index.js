"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const bad_words_1 = __importDefault(require("bad-words"));
require("./db/mongoose");
const userModel_1 = require("./db/models/userModel");
const messages_1 = require("./utils/messages");
const roomModel_1 = require("./db/models/roomModel");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const port = process.env.PORT || 3000;
// const publicDir = path.join(__dirname, '../../public');
const clientDir = path_1.default.join(__dirname, "../../dist/public");
let user;
// Middleware
io.use(async (socket, next) => {
    console.log("Middleware");
    const token = socket.handshake.auth.token;
    if (token === null)
        next(new Error("Authorization needed!"));
    else if (token === "hello")
        next();
    user = await userModel_1.User.findOne({ token });
    next();
});
// app.use(express.static(publicDir));
app.use(express_1.default.static(clientDir));
io.on("connection", (socket) => {
    socket.on("login", async ({ username }) => {
        const user = await userModel_1.User.findOne({ username });
        if (!user) {
            return socket.emit("notFound");
        }
        else if (user.token !== undefined) {
            return socket.emit("already_logged_in");
        }
        const token = await user.genToken();
        socket.emit("found", token);
    });
    socket.on("in_lobby", async () => {
        if (user?.currentRoom) {
            const room = await roomModel_1.Room.findOne({ _id: user?.currentRoom });
            console.log(room.name);
            socket.emit("userReturned", room.name);
        }
        socket.on("joinRoom", async ({ roomName, username }) => {
            const room = await roomModel_1.Room.findOne({ name: roomName });
            if (!room) {
                return console.log("room not found");
            }
            socket.join(roomName);
            socket.emit("loadMessages", room.messages);
            // Sending a new message to everyone
            socket.on("sendMessage", (msg, ack) => {
                const filter = new bad_words_1.default();
                if (filter.isProfane(msg)) {
                    return ack("Profanity is not allowed");
                }
                const message = (0, messages_1.genMessage)(msg, username);
                room.addMessage(message);
                io.to(roomName).emit("message", message);
                ack("Message sent!");
            });
            socket.broadcast.to(roomName).emit("message", (0, messages_1.genMessage)(`${username} has joined the room!`, "Admin"));
            // Greeting new user only
            socket.emit("message", (0, messages_1.genMessage)("Welcome User!", "Admin"));
            // Alerting users that someone has left
            socket.on("disconnect", () => {
                io.to(roomName).emit("message", (0, messages_1.genMessage)(`${username} has left the room :(`, "Admin"));
            });
            // Sending location to everyone
            socket.on("sendLocation", ({ latitude, longitude }, ack) => {
                const locationMessage = (0, messages_1.genMessage)(`https://google.com/maps?q=${latitude},${longitude}`, username);
                io.to(roomName).emit("sendLocationMessage", locationMessage);
                room.addMessage(locationMessage);
                ack("Location was shared successfully!");
            });
        });
        // Logout
        socket.on("logout", async (token) => {
            const user = await userModel_1.User.findOne({ token });
            if (user) {
                await user.logOut();
                socket.emit("loggedOut");
            }
        });
        // Diconnect
        //     socket.on("disconnect", async () => {
        //         console.log("left lobby");
        //     })
    });
});
server.listen(port, () => console.log(`Server up on port ${port}`));
// async function test() {
//     const name = "bedroom";
//     const msg1: Message = {
//         text: "text1",
//         createdAt: "date1",
//     }
//     const msg2: Message = {
//         text: "text2",
//         createdAt: "date2",
//     }
//     const msg3: Message = {
//         text: "text3",
//         createdAt: "date3",
//     }
//     const messages = [msg1, msg2, msg3]
//     const room = new Room({ name, messages });
//     await room.save();
//     const user = await User.findOne({ username: "marwano" });
//     if (user) {
//         user.currentRoom = room._id;
//         await user.save();
//     }
//     await room.populate("users");
//     const roomObj = room.toObject();
//     console.log(roomObj);
//     console.log(user?._id);
// }
// test()
