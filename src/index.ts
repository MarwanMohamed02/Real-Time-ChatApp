import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import Filter from "bad-words"
require("./db/mongoose")
import { User, IUser, UserDocument } from "./db/models/userModel";
import { genMessage, Message } from "./utils/messages"
import { Room, RoomDocument } from "./db/models/roomModel";



const app = express();
const server = http.createServer(app);
const io = new Server(server);




const port = process.env.PORT || 3000;



// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");

let user: UserDocument | undefined | null;

// Middleware
io.use(async (socket, next) => {
    console.log("Middleware");
    const token = socket.handshake.auth.token; 
    if (token === null)
        next(new Error("Authorization needed!"));
    else if (token === "hello")
        next();
    
    user = await User.findOne({ token });
    next()
})

// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    
    socket.on("login", async ({ username }) => {
        const user = await User.findOne({ username }) as UserDocument;
        
        if (!user) {
            return socket.emit("notFound");
        }
        else if (user.token !== undefined) {
            return socket.emit("already_logged_in")
        }
        
        const token = await user.genToken();

        socket.emit("found", token);           
    });

    socket.on("in_lobby", async () => {

        if (user?.currentRoom) {
            const room = await Room.findOne({ _id: user?.currentRoom }) as RoomDocument;
            console.log(room.name);
            socket.emit("userReturned", room.name);
        }        

        socket.on("joinRoom", async ({roomName, username}) => {
    
            const room = await Room.findOne({ name: roomName })
    
            if (!room) {
                return console.log("room not found");
            }
    
            socket.join(roomName);
    
    
            socket.emit("loadMessages", room.messages);
    
            // Sending a new message to everyone
            socket.on("sendMessage", (msg: string, ack) => {
                const filter = new Filter();
    
                if (filter.isProfane(msg)) {
                    return ack("Profanity is not allowed");
                }
    
                const message = genMessage(msg, username)
                room.addMessage(message);
    
                io.to(roomName).emit("message", message);
                ack("Message sent!");
            })
    
            socket.broadcast.to(roomName).emit("message", genMessage(`${username} has joined the room!`, "Admin"));
    
            // Greeting new user only
            socket.emit("message", genMessage("Welcome User!", "Admin"));
    
            // Alerting users that someone has left
            socket.on("disconnect", () => {
                
                io.to(roomName).emit("message", genMessage(`${username} has left the room :(`, "Admin"))
            })
    
    
    
            // Sending location to everyone
            socket.on("sendLocation", ({ latitude, longitude }, ack) => {
                const locationMessage = genMessage(`https://google.com/maps?q=${latitude},${longitude}`, username);
                io.to(roomName).emit("sendLocationMessage", locationMessage);
                room.addMessage(locationMessage);
                ack("Location was shared successfully!")
            })
    
        })

    
        // Logout
        socket.on("logout", async (token) => {
            const user = await User.findOne({ token }) as UserDocument;
            
            if (user) {
                await user.logOut();
        
                socket.emit("loggedOut");
            }
        })


        // Diconnect
    //     socket.on("disconnect", async () => {
    //         console.log("left lobby");
    //     })
    })

    
    
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

