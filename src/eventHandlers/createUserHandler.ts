import { Server, Socket } from "socket.io";
import { User } from "../db/models/userModel";


export function createUserHandler(io: Server, socket: Socket) {
    
    socket.on("createNewUser", async ({ username, password }) => {
        try {
            if (await User.findOne({ username }))
                return socket.emit("duplicate_user_error");
            
            const user = new User({ username, password });
        
            await user.genToken();
        
            await user.save();

            socket.emit("user_created", user);
        }
        catch (err: any) {
            socket.emit("db_error", err);
            console.log("Create user err: \n" + err);        }
    })

}