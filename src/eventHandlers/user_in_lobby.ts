import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";
import { joinRoomHandler } from "./user_joins_room";



export function userInLobbyHandler(io: Server, socket: Socket, user: UserDocument | undefined | null) {

    socket.on("in_lobby", async () => {

        if (user?.currentRoom) {
            const room = await Room.findOne({ _id: user?.currentRoom }) as RoomDocument;
            console.log(room.name);
            socket.emit("userReturned", room.name);
        }

        joinRoomHandler(io, socket, user);
        
    })
}