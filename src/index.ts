import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import Filter from "bad-words"
require("./db/mongoose")
import { User, IUser } from "./db/models/userModel";

import { genMessage } from "./utils/messages";

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const port = process.env.PORT || 3000;


// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");


// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    
    socket.on("login", async ({ username, room }) => {
        const sameUsername = await User.findOne({ username });
        if (!sameUsername || room !== "myRoom") {
            socket.emit("notFound");
        }
        else
            socket.emit("found");
    });
    
    socket.on("joinData", async ({ username, room }) => {
        
        socket.join(room);

        // Alerting other users that a new user has entered
        socket.broadcast.to(room).emit("message", genMessage(`${username} has joined the room!`));

        // Greeting new user only
        socket.emit("message", genMessage("Welcome User!"));

        // Alerting users that someone has left
        socket.on("disconnect", () => {
            io.to(room).emit("message", genMessage(`${username} has left the room :(`))
        })

        // Sending a new message to everyone
        socket.on("sendMessage", (msg: string, ack) => {
            const filter = new Filter();
    
            if (filter.isProfane(msg)) {
                return ack("Profanity is not allowed");
            }
    
            io.to(room).emit("message", genMessage(msg));
            ack("Message sent!");
        })
    
        // Sending location to everyone
        socket.on("sendLocation", ({ latitude, longitude }, ack) => {
            io.to(room).emit("sendLocationMessage", genMessage(`https://google.com/maps?q=${latitude},${longitude}`));
            ack("Location was shared successfully!")
        })
    })
    
    


    
})





server.listen(port, () => console.log(`Server up on port ${port}`))
