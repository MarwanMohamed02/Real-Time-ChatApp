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
    socket.broadcast.emit("sendMessage", "A new user has entered");
    socket.emit("sendMessage", "Welcome User!");
    socket.on("sendMessage", (message) => {
        io.emit("sendMessage", message);
    });
    socket.on("disconnect", () => {
        io.emit("sendMessage", "A user has left :(");
    });
});
server.listen(port, () => console.log(`Server up on port ${port}`));
