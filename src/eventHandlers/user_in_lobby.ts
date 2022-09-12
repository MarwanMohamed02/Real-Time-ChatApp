import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";
import { UserDocument } from "../db/models/userModel";
import { createRoomHandler } from "./createRoomHandler";
import { joinRoomHandler } from "./joinRoomHandler";
import { userLogoutHandler } from "./userLogoutHander";



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

        let room: RoomDocument;

        socket.on("findRoom", async (roomName) => {
            try {
                const room = await Room.findOne({ name: roomName }) as RoomDocument;

                if (!room) {
                    socket.emit("room_not_found", roomName);
                }
                else
                    socket.emit("room_found", room.name);
            }
            catch (err: any) {
                socket.emit("db_error", err.message);
                console.log("Find room err: \n" + err);
            }
        })

        joinRoomHandler(io, socket, user);

        try {
            socket.emit("showActiveRooms", await Room.getActiveRooms());
        }
        catch (err: any) {
            socket.emit("db_error", err);
            console.log("Show active rooms err: \n" + err);
        }
        
        createRoomHandler(io, socket, user as UserDocument);

        userLogoutHandler(io, socket);
    })

}