import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { User, UserDocument } from "../db/models/userModel";
import { genMessage } from "../utils/messages";
import { messagesHandler } from "./messagesHandler";
import { roomDataHandler } from "./roomDataHandler";


export function joinRoomHandler(io: Server, socket: Socket, user: UserDocument) {

    socket.on("joinRoom", async({ roomName, username }) => {

        let room = await Room.findOne({ name: roomName }) as RoomDocument;

        if (!room) {
            return socket.emit("room_not_found");
        }
            
        
        if (!user.currentRoom || !(user.currentRoom?.toString() === room._id.toString())) {
            socket.broadcast.to(room.name).emit("message", genMessage(`${username} has joined the room!`));
        }
        
        user.currentRoom = room._id;
        await user.save();
        
        socket.join(room.name);
        
        socket.emit("user_joined_room", room.name);

        
        messagesHandler(io, socket, room, username);


        roomDataHandler(io, socket, room);

        
        // Alerting users that someone has left
        socket.on("leaveRoom", async () => {
            if (user) {
                user.currentRoom = undefined
                await user.save();
            }

            socket.leave(room.name);
            io.to(room.name).emit("message", genMessage(`${username} has left the room :(`));

            await room.populate("users");

            io.to(room.name).emit("showRoomers", room.toObject().users);
        })
    })



    // Logout
    socket.on("logout", async (token) => {
        const user = await User.findOne({ token }) as UserDocument;

        if (user) {
            await user.logOut();

            socket.emit("loggedOut");
        }
    })


    // Diconnect
    //     socket.on("disconnect", async () => {
    //         console.log("left lobby");
    //     })
}