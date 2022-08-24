import express from "express"
import http from "http"
import path from "path";
import { Server } from "socket.io";
import Filter from "bad-words"
require("./db/mongoose")
import { User, IUser } from "./db/models/userModel";
import { genMessage, Message } from "./utils/messages"
import { Room } from "./db/models/roomModel";



const app = express();
const server = http.createServer(app);
const io = new Server(server);


const port = process.env.PORT || 3000;



// const publicDir = path.join(__dirname, '../../public');
const clientDir = path.join(__dirname, "../../dist/public");


// app.use(express.static(publicDir));
app.use(express.static(clientDir));


io.on("connection", (socket) => {

    
    socket.on("login", async ({ username }) => {
        const sameUsername = await User.findOne({ username });
        if (!sameUsername) {
            socket.emit("notFound");
        }
        else
            socket.emit("found");
        
        
    });

    socket.on("joinRoom", async ({roomName, username}) => {

        const room = await Room.findOne({ name: roomName })

        if (!room) {
            return console.log("room not found");
        }

        socket.join(roomName);

        room.addMessage(genMessage("Hellooo"));

        socket.emit("userJoined", room.messages);

        // Sending a new message to everyone
        socket.on("sendMessage", (msg: string, ack) => {
            const filter = new Filter();

            if (filter.isProfane(msg)) {
                return ack("Profanity is not allowed");
            }

            const message = genMessage(msg)
            room.addMessage(message);

            io.to(roomName).emit("message", message);
            ack("Message sent!");
        })

        socket.broadcast.to(roomName).emit("message", genMessage(`${username} has joined the room!`));

        // Greeting new user only
        socket.emit("message", genMessage("Welcome User!"));

        // Alerting users that someone has left
        socket.on("disconnect", () => {
            io.to(roomName).emit("message", genMessage(`${username} has left the room :(`))
        })



        // Sending location to everyone
        socket.on("sendLocation", ({ latitude, longitude }, ack) => {
            const locationMessage = genMessage(`https://google.com/maps?q=${latitude},${longitude}`);
            io.to(roomName).emit("sendLocationMessage", locationMessage);
            room.addMessage(locationMessage);
            ack("Location was shared successfully!")
        })
    })
    
    socket.on("joinData", async ({ username, room }) => {
        
        socket.join(room);  // gives us access to send messsages to sepcific rooms  => .to(room)

        // Alerting other users that a new user has entered
        

       
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

