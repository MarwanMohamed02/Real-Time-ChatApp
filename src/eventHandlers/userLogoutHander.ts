import { Server, Socket } from "socket.io";
import { User, UserDocument } from "../db/models/userModel";


export function userLogoutHandler(io: Server, socket: Socket) {
    socket.on("logout", async (token) => {
        try {
            const user = await User.findOne({ token }) as UserDocument;

            if (user) {
                await user.logOut();

                socket.emit("loggedOut");
            }
        }
        catch (err: any) {
            socket.emit("db_error");
        }
    })
}