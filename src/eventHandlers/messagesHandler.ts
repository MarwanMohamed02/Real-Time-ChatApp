import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { genMessage } from "../utils/messages";
import Filter from "bad-words"
import { UserDocument } from "../db/models/userModel";



export async function messagesHandler(io: Server, socket: Socket, room: RoomDocument, user: UserDocument) {

    socket.emit("loadMessages", room.messages);

    socket.emit("showActiveRooms", await Room.getActiveRooms());

   
    // Greeting new user only
    socket.emit("message", genMessage("Welcome User!"));


    // Sending a new message to everyone
    socket.on("sendMessage", async (msg: string, ack) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return ack("Profanity is not allowed");
        }
        
        console.log(socket.rooms);
        console.log(`${room.name} sent a message`)

        const message = genMessage(msg, user);
        
        room.addMessage(message);

        io.emit("showActiveRooms", await Room.getActiveRooms());

        io.to(room.name).emit("message", message);
        
    })


    // Sending location to everyone
    socket.on("sendLocation", ({ latitude, longitude }, ack) => {
        const locationMessage = genMessage(`https://google.com/maps?q=${latitude},${longitude}`, user);
        io.to(room.name).emit("sendLocationMessage", locationMessage);
        room.addMessage(locationMessage);
        ack("Location was shared successfully!")
    })

}