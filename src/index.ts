import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const port = process.env.PORT || 3000;

// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");


// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    // Alerting other users that a new user has entered
    socket.broadcast.emit("message", "A new user has entered")
    
    // Greeting new user only
    socket.emit("message", "Welcome User!");

    // Sending a new message to everyone
    socket.on("sendMessage", (message: string, ack) => {
        io.emit("message", message);
        ack("Message sent!");
    })

    // Sending location to everyone
    socket.on("sendLocation", ({ latitude, longitude }, ack) => {
        io.emit("message", `User has shared his location: https://google.com/maps?q=${latitude},${longitude}`);
        ack("Location was shared successfully!")
    })

    // Alerting users that someone has left
    socket.on("disconnect", () => {
        io.emit("message", "A user has left :(")
    })
})





server.listen(port, () => console.log(`Server up on port ${port}`))
