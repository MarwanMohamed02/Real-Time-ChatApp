import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";
import { createRoomHandler } from "./createRoomHandler";
import { joinRoomHandler } from "./joinRoomHandler";



export function userInLobbyHandler(io: Server, socket: Socket, user: UserDocument) {

    socket.on("user_in_lobby", async () => {

        if (user.currentRoom) {
            const room = await Room.findOne({ _id: user.currentRoom }) as RoomDocument;
            socket.emit("user_returned", room);
        }

        joinRoomHandler(io, socket, user);

        socket.emit("showActiveRooms", await Room.getActiveRooms());
        
        createRoomHandler(io, socket, user as UserDocument);
    })

}