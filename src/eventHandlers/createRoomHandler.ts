import { Server, Socket } from "socket.io";
import { Room } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";



export function createRoomHandler(io: Server, socket: Socket, user: UserDocument) {
    socket.on("createNewRoom", async (newRoomName: string) => {
        try {
            const newRoom = new Room({ name: newRoomName });
            await newRoom.save();
    
            console.log(`created ${newRoom.name}`);
    
            socket.emit("user_created_room", newRoom.name);
        }
        catch (err: any) {
            if (err.code === 11000)
                socket.emit("duplicate_room_error");
            else
                socket.emit("db_error");
        }
    })
}