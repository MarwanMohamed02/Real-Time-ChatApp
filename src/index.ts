import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import { Socket } from "socket.io-client";

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const port = process.env.PORT || 3000;

// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");


// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    socket.broadcast.emit("sendMessage", "A new user has entered")
    
    socket.emit("sendMessage", "Welcome User!");

    socket.on("sendMessage", (message: string) => {
        io.emit("sendMessage", message);
    })

    socket.on("disconnect", () => {
        io.emit("sendMessage", "A user has left :(")
    })
})





server.listen(port, () => console.log(`Server up on port ${port}`))
