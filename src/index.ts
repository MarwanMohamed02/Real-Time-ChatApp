import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import { connect_to_db } from "./db/mongoose";
import { UserDocument } from "./db/models/userModel"
import { createUserHandler } from "./eventHandlers/createUserHandler";
import { userLoginHandler } from "./eventHandlers/userLogin"
import { userInLobbyHandler } from "./eventHandlers/user_in_lobby";
import { authUser } from "./middleware/authUser";
import Stack from "../public/utils/Stack"


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", }
});


try {
    connect_to_db();
}
catch (err: any) {
    io.emit("db_error");
}


const port = process.env.PORT;

const clientDir = path.join(__dirname, "../public");
app.use(express.static(clientDir));


app.get("/", (req, res) => {
    res.sendFile("/index.html");
})

// const publicDir = path.join(__dirname, '../../public');

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


io.on("connection", (socket) => {

    try {
        userLoginHandler(io, socket);
    
        createUserHandler(io, socket);
    
        userInLobbyHandler(io, socket, user as UserDocument);  
    }
    catch (err: any) {
        socket.emit("db_error", err);
        console.log("General Error\n" + err);
    }
        
})



server.listen(port, () => console.log(`Server up on port ${port}`));


// let stack = new Stack<number>();

// stack.push(5)
// stack.push(4)
// stack.push(3)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// stack.push(2)
// console.log(stack.arr)

// async function test() {
    
//     const name = "bedroom";

   
    
//     const msg1: Message = {
//         author: "Me",
//         text: "text1",
//         createdAt: "date1",
//     }
    
//     const msg2: Message = {
//         author: "Me",
//         text: "text2",
//         createdAt: "date2",
//     }
    
//     const msg3: Message = {
//         author: "Me",
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

