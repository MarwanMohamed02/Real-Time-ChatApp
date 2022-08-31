import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";
import { createRoomHandler } from "./createRoomHandler";
import { joinRoomHandler } from "./joinRoomHandler";



export function userInLobbyHandler(io: Server, socket: Socket, user: UserDocument) {

    socket.on("user_in_lobby", async () => {

        if (user.currentRoom) {
            try {
                const room = await Room.findOne({ _id: user.currentRoom }) as RoomDocument;
                socket.emit("user_returned", room);
            }
            catch (err: any) {
                socket.emit("db_error");
            }
        }

        joinRoomHandler(io, socket, user);

        try {
            socket.emit("showActiveRooms", await Room.getActiveRooms());
        }
        catch (err: any) {
            socket.emit("db_error");
        }
        
        createRoomHandler(io, socket, user as UserDocument);
    })

}