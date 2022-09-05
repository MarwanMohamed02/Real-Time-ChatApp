import { Server, Socket } from "socket.io";
import { RoomDocument } from "../db/models/roomModel";



export async function updateRoomData(io: Server, socket: Socket, room: RoomDocument) {
    await room.populate("users");

    io.to(room.name).emit("showRoomers", room.toObject().users);
}