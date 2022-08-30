import { Server, Socket } from "socket.io";
import { User } from "../db/models/userModel";


export function createUserHandler(io: Server, socket: Socket) {
    
    socket.on("createNewUser", async ({ username }) => {
        const user = new User({ username });
        
        await user.genToken();
        
        await user.save();

        socket.emit("user_created", user);
    })

}