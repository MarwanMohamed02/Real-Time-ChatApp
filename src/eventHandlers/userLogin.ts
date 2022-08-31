import { Server, Socket } from "socket.io"
import { User, UserDocument } from "../db/models/userModel";

export function userLoginHandler(io: Server, socket: Socket) {
    socket.on("login", async ({ username }) => {
        try {
            const user = await User.findOne({ username }) as UserDocument;

            if (!user) {
                return socket.emit("notFound");
            }
            else if (user.token !== undefined) {
                return socket.emit("already_logged_in")
            }

            const token = await user.genToken();

            socket.emit("found", { token, username, _id: user._id.toString() });
        }
        catch (err: any) {
            io.emit("db_error");

        }
    });

}