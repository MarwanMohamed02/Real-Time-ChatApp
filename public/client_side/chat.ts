import { io } from "socket.io-client"
import mustache from "mustache"
import Qs from "query-string"
import { Message } from "../../src/utils/messages"
import { IUser } from "../../src/db/models/userModel"

const { username } = Qs.parse(location.search);

const { token } = sessionStorage;

const socket = io("http://localhost:3000", {
    auth: {
        token
    }
});

socket.emit("in_lobby");



/* Fetching Elements */

const feed = document.querySelector("#feed") as HTMLDivElement;

// Left Sidebar Elements
const joinRoomButton = document.querySelector("#join-room-button") as HTMLButtonElement;
const roomName = document.querySelector("#room-name") as HTMLInputElement;

const usersList = document.getElementById("users-list") as HTMLDivElement

// Message Form Elements
const form = document.querySelector("form") as HTMLFormElement;
const message = form.querySelector("#message") as HTMLInputElement;
const sendMessageButton = form.querySelector("#sendMessage") as HTMLButtonElement;

// Location elements
const sendLocationButton = document.querySelector("#sendLocation") as HTMLButtonElement;

// Right Sidebar Elements
const logoutButton = document.querySelector("#logout-button") as HTMLButtonElement;
const leaveRoomButton = document.querySelector("#leave-room-button") as HTMLButtonElement;

// Mustache templates
const adminMessageTemplate = document.getElementById("admin-message-template")?.innerHTML as string
const messageTemplate = document.querySelector("#message-template")?.innerHTML as string;
const locationMessageTemplate = document.querySelector("#location-message-template")?.innerHTML as string;
const roomatesListTemplate = document.getElementById("roomates-list-template")?.innerHTML as string;

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

socket.on("userReturned", (roomName: string) => {
    console.log("ahoo");
    socket.emit("joinRoom", { roomName, username });
})

socket.on("showRoomers", (users: IUser[]) => {
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
})

socket.on("loggedOut", () => {
    document.location.href = "./"
    sessionStorage.removeItem(`${username}_token`);
})


socket.on("connect_error", (err) => {
    alert(err.message);
    document.location.href = "./"
})

/* DOM Listeners*/

joinRoomButton.onclick = () => {
    if (sessionStorage.getItem("room") !== roomName.value) {
        if (roomName.value.length !== 0) {
            const room = roomName.value;
            sessionStorage.setItem("room", room);
            roomName.value = "";
        
            socket.emit("joinRoom", { roomName: room, username });
        }
    }
    else {
        roomName.value = "";
        roomName.placeholder = "You are already in this room";
    }
}

leaveRoomButton.onclick = () => {
    sessionStorage.removeItem("room")
    usersList.innerHTML = ""
    feed.innerHTML = "";
    sendMessageButton.disabled = true;
    sendLocationButton.disabled = true;
    socket.emit("leaveRoom");
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
    socket.emit("logout", token);
}

