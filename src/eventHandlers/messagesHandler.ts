import { Server, Socket } from "socket.io";
import { RoomDocument } from "../db/models/roomModel";
import { genMessage } from "../utils/messages";
import Filter from "bad-words"



export  function messagesHandler(io: Server, socket: Socket, room: RoomDocument, username: string) {

    socket.emit("loadMessages", room.messages);

    socket.broadcast.to(room.name).emit("message", genMessage(`${username} has joined the room!`));

    // Greeting new user only
    socket.emit("message", genMessage("Welcome User!", "Admin"));


    // Sending a new message to everyone
    socket.on("sendMessage", (msg: string, ack) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return ack("Profanity is not allowed");
        }
        

        const message = genMessage(msg, username)
        room.addMessage(message);

        io.to(room.name).emit("message", message);
        ack("Message sent!");
    })


    // Sending location to everyone
    socket.on("sendLocation", ({ latitude, longitude }, ack) => {
        const locationMessage = genMessage(`https://google.com/maps?q=${latitude},${longitude}`, username);
        io.to(room.name).emit("sendLocationMessage", locationMessage);
        room.addMessage(locationMessage);
        ack("Location was shared successfully!")
    })

}