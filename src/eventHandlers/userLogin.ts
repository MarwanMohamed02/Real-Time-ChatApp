import { Server, Socket } from "socket.io"
import { User, UserDocument } from "../db/models/userModel";

export function userLoginHandler(io: Server, socket: Socket) {
    socket.on("login", async ({ username, password }) => {
        try {
            const {user, error} = await User.login(username, password);

            if (error) {
                return socket.emit("login_error", error.message);
            }
            else if (user?.token !== undefined) {
                return socket.emit("already_logged_in")
            }

            const token = await user?.genToken();

            socket.emit("found", { token, username, _id: user?._id.toString() });
        }
        catch (err: any) {
            socket.emit("db_error", err);
            console.log("Login err: \n" + err);
        }
    });

}