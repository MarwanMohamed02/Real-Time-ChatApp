import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { User, UserDocument } from "../db/models/userModel";
import { genMessage } from "../utils/messages";
import { leaveRoomHandler } from "./leaveRoomHandler";
import { messagesHandler } from "./messagesHandler";
import { updateRoomData } from "./updateRoomData";


export function joinRoomHandler(io: Server, socket: Socket, user: UserDocument) {

    socket.on("joinRoom", async({ roomName, username }) => {
        try {
            let room = await Room.findOne({ name: roomName }) as RoomDocument;
    
            if (!room) {
                return socket.emit("room_not_found", roomName);
            }
                
            
            if (!user.currentRoom || !(user.currentRoom?.toString() === room._id.toString())) {
                
                socket.broadcast.to(room.name).emit("message", genMessage(`${username} has joined the room!`));
            }
            
            user.currentRoom = room._id;
            await user.save();
            
            socket.join(room.name);
            
            socket.emit("user_joined_room", room.name);
    
            
            messagesHandler(io, socket, room, user);
    
    
            updateRoomData(io, socket, room);
    
            
            leaveRoomHandler(io, socket, user, room);
        }
        catch (err: any) {
            socket.emit("db_error");
        }
    })   
}