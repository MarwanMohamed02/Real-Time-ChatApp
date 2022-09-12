import { Server, Socket } from "socket.io";
import { RoomDocument } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";
import { genMessage } from "../utils/messages";
import { updateRoomData } from "./updateRoomData";


export function leaveRoomHandler(io: Server, socket: Socket, user: UserDocument, room: RoomDocument) {

    socket.on("leaveRoom", async () => {
        try {
            if (user) {
                user.currentRoom = undefined
                await user.save();
            }
    
            console.log(`${user.username} left ${room.name}`)
    
            socket.leave(room.name);
            io.to(room.name).emit("message", genMessage(`${user.username} has left the room :(`));
    
            socket.emit("user_left_room");
    
            updateRoomData(io, socket, room);
        }
        catch (err: any) {
            socket.emit("db_error", err);
            console.log("Leave room err: \n" + err);
        }
    })

}