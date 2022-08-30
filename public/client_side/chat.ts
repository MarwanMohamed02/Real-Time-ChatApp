import { io } from "socket.io-client"
import mustache from "mustache"
import { Message } from "../../src/utils/messages"
import { IUser } from "../../src/db/models/userModel"
import { IRoom, RoomDocument } from "../../src/db/models/roomModel"


const { token, username } = sessionStorage;

const socket = io("http://localhost:3000", {
    auth: {
        token
    }
});


socket.emit("user_in_lobby");


/* Fetching Elements */

const feed = document.querySelector("#feed") as HTMLDivElement;

// Left Sidebar Elements

const usersList = document.getElementById("users-list") as HTMLDivElement

// Message Form Elements
const form = document.querySelector("form") as HTMLFormElement;
const message = form.querySelector("#message") as HTMLInputElement;
const sendMessageButton = form.querySelector("#sendMessage") as HTMLButtonElement;

// Location elements
const sendLocationButton = document.querySelector("#sendLocation") as HTMLButtonElement;

// Right Sidebar Elements
const joinRoomButton = document.querySelector("#join-room-button") as HTMLButtonElement;
const roomName = document.querySelector("#room-name") as HTMLInputElement;

const activeRoomsList = document.getElementById("active-rooms-list") as HTMLDivElement;

const createRoomButton = document.getElementById("create-room-button") as HTMLButtonElement;
const newRoomName = document.getElementById("new-room-name") as HTMLInputElement;

const logoutButton = document.querySelector("#logout-button") as HTMLButtonElement;
const leaveRoomButton = document.querySelector("#leave-room-button") as HTMLButtonElement;

// Mustache templates
const adminMessageTemplate = document.getElementById("admin-message-template")?.innerHTML as string
const messageTemplate = document.querySelector("#message-template")?.innerHTML as string;
const locationMessageTemplate = document.querySelector("#location-message-template")?.innerHTML as string;
const roomatesListTemplate = document.getElementById("roomates-list-template")?.innerHTML as string;
const activeRoomsListTemplate = document.getElementById("active-rooms-list-template")?.innerHTML as string;

sendMessageButton.disabled = true;
sendLocationButton.disabled = true;


/* Server Listeners */

// Sending a message
socket.on("message", (message: Message) => {
    const template = message.author === "Admin" ? adminMessageTemplate : messageTemplate;
    let updatedHTML = mustache.render(template, message);
    feed.insertAdjacentHTML("beforeend",updatedHTML);
})

// Sending a location message
socket.on("sendLocationMessage", (url: Message) => {
    let updatedHTML = mustache.render(locationMessageTemplate, url);
    feed.insertAdjacentHTML("beforeend", updatedHTML);
})

socket.on("loadMessages", (messages: Message[]) => {
    for (let i = 0; i < messages.length; i++) {
        const { author, text, createdAt } = messages[i];
        const template = text.includes("https://google.com/maps") ? locationMessageTemplate : messageTemplate;
        let updatedHTML =  mustache.render(template, { author, text, createdAt });
        feed.insertAdjacentHTML("beforeend", updatedHTML);
    }
    sendMessageButton.disabled = false;
    sendLocationButton.disabled = false;
})

socket.on("user_joined_room", (room: string) => {
    feed.innerHTML = "";
    sessionStorage.setItem("room", room);
    message.focus();
})

socket.on("user_created_room", (newRoomName: string) => {
    feed.innerHTML = "";
    const currentRoom = sessionStorage.getItem("room");
    socket.emit("joinRoom", { roomName: newRoomName, username }, currentRoom);
})

socket.on("user_returned", (room: RoomDocument) => {
    socket.emit("joinRoom", { roomName: room.name, username }, room);
})

socket.on("showRoomers", (users: IUser[]) => {
    if (users.length !== 0) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].token === token) {
                users[i].username = "You";
                let temp = users[0];
                users[0] = users[i];
                users[i] = temp;
            }
        }
        const updatedHTML = mustache.render(roomatesListTemplate, { users });
        usersList.innerHTML = updatedHTML;
    }
})

socket.on("showActiveRooms", (activeRooms: IRoom[]) => {
    console.log("ahoo");
    const updatedHTML = mustache.render(activeRoomsListTemplate, { activeRooms });
    activeRoomsList.innerHTML = updatedHTML;
})


socket.on("loggedOut", () => {
    document.location.href = "./"
    sessionStorage.removeItem(`${username}_token`);
})

socket.on("room_not_found", () => {
    
    roomName.value = "";
    roomName.placeholder = "Room not found... try again";
})

socket.on("connect_error", (err) => {
    alert(err.message);
    document.location.href = "./"
})

/* DOM Listeners*/

joinRoomButton.onclick = async (e) => {
    let currentRoom = sessionStorage.getItem("room");
    if (currentRoom !== roomName.value && roomName.value.length !== 0) {    
        
        if (currentRoom) {
            socket.emit("leaveRoom");
        }
        const room = roomName.value;
        roomName.value = "";
        roomName.placeholder = "Enter a room to join...";
        socket.emit("joinRoom", { roomName: room, username });
    }
    else {
        roomName.value = "";
        roomName.placeholder = "You are already in this room";
    }
}

leaveRoomButton.onclick = () => {
    roomName.placeholder = "Enter a room to join...";
    sessionStorage.removeItem("room")
    usersList.innerHTML = ""
    feed.innerHTML = "";
    sendMessageButton.disabled = true;
    sendLocationButton.disabled = true;
    socket.emit("leaveRoom");    
}

createRoomButton.onclick = () => {
    if (sessionStorage.getItem("room"))
        socket.emit("leaveRoom");
    socket.emit("createNewRoom", newRoomName.value);
}


// Sending username & room to server
//socket.emit("joinData", { username, room });

// Reading and sending a message from the user
form.addEventListener("submit", (event) => {
    event.preventDefault();

    
    // disabling the button to prevent multiple sends
    sendMessageButton.disabled = true;

    // sending message to the users
    socket.emit("sendMessage", message.value, (msg: string) => {
        console.log(msg);
        sendMessageButton.disabled = false;
    });

    // resetting after sending message
    message.value = "";
    message.focus();
})


// Sending location
sendLocationButton.onclick = function () {
    
    sendLocationButton.disabled = true;
    
    if (!navigator.geolocation) {
        sendLocationButton.disabled = false;
        return alert("Geolocation is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("sendLocation", {latitude, longitude}, (msg: string) => {
            sendLocationButton.disabled = false;
            console.log(msg)
        });
    })
}

// Logout
logoutButton.onclick = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    socket.emit("logout", token);
}

