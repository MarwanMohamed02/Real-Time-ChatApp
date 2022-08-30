import { Server, Socket } from "socket.io";
import { Room, RoomDocument } from "../db/models/roomModel";



export async function roomDataHandler(io: Server, socket: Socket, room: RoomDocument) {
    await room.populate("users");

    io.to(room.name).emit("showRoomers", room.toObject().users);
}