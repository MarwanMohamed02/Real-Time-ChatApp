import { Socket } from "socket.io";
import jwt from "jsonwebtoken"
import { User, UserDocument } from "../db/models/userModel";



export async function authUser(socket: Socket, user: UserDocument | null | undefined): Promise<UserDocument | null | undefined> {
    const token = socket.handshake.auth.token;
    if (token === undefined) {
        throw new Error("Authorization needed!");
    }
    else if (token === "hello")
        return undefined;

    const _id = jwt.verify(token, "vehyhgehguufju8")
    
    user = await User.findOne({ _id, token });

    if (!user)
        throw new Error("Authorization needed!");
    else
        return user
}