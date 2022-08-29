import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
require("./db/mongoose")
import { User, UserDocument } from "./db/models/userModel"
import { userLoginHandler } from "./eventHandlers/userLogin"
import { userInLobbyHandler } from "./eventHandlers/user_in_lobby";
import { authUser } from "./middleware/authUser";



const app = express();
const server = http.createServer(app);
const io = new Server(server);




const port = process.env.PORT || 3000;



// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");

let user: UserDocument | undefined | null;

// Middleware
io.use(async (socket, next) => {
    try {
        user = await authUser(socket, user);
        next();
    }
    catch (err: any) {
        next(err);
    }
})

// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    
    userLoginHandler(io, socket);

    userInLobbyHandler(io, socket, user);   
    
})



server.listen(port, () => console.log(`Server up on port ${port}`));


// async function test() {
    
//     const name = "bedroom";

   
    
//     const msg1: Message = {
//         text: "text1",
//         createdAt: "date1",
//     }
    
//     const msg2: Message = {
//         text: "text2",
//         createdAt: "date2",
//     }
    
//     const msg3: Message = {
//         text: "text3",
//         createdAt: "date3",
//     }
    
//     const messages = [msg1, msg2, msg3]
    
//     const room = new Room({ name, messages });

//     await room.save();
    
//     const user = await User.findOne({ username: "marwano" });
//     if (user) {
//         user.currentRoom = room._id;
//         await user.save();
//     }
    
//     await room.populate("users");

//     const roomObj = room.toObject();

//     console.log(roomObj);
//     console.log(user?._id);
// }

// test()

