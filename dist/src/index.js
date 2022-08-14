"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const port = process.env.PORT || 3000;
// const publicDir = path.join(__dirname, '../../public');
const clientDir = path_1.default.join(__dirname, "../../dist/public");
// app.use(express.static(publicDir));
app.use(express_1.default.static(clientDir));
io.on("connection", (socket) => {
    // Alerting other users that a new user has entered
    socket.broadcast.emit("message", "A new user has entered");
    // Greeting new user only
    socket.emit("message", "Welcome User!");
    // Sending a new message to everyone
    socket.on("sendMessage", (message) => {
        io.emit("message", message);
    });
    // Sending location to everyone
    socket.on("sendLocation", ({ latitude, longitude }) => {
        io.emit("message", `User has shared his location: https://google.com/maps?q=${latitude},${longitude}`);
    });
    // Alerting users that someone has left
    socket.on("disconnect", () => {
        io.emit("message", "A user has left :(");
    });
});
server.listen(port, () => console.log(`Server up on port ${port}`));
