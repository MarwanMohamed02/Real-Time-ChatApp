import { io } from "socket.io-client"
import mustache from "mustache"
import Qs from "query-string"
import { Message } from "../../src/utils/messages"

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
const joinRoomButton = document.querySelector("#join-room-button") as HTMLButtonElement;
const roomName = document.querySelector("#room-name") as HTMLInputElement;

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
const messageTemplate = document.querySelector("#message-template")?.innerHTML as string;
const locationMessageTemplate = document.querySelector("#location-message-template")?.innerHTML as string


sendMessageButton.disabled = true;
sendLocationButton.disabled = true;


/* Server Listeners */

// Sending a message
socket.on("message", (message: Message) => {
    let updatedHTML = mustache.render(messageTemplate, message);
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

socket.on("loggedOut", () => {
    document.location.pathname = "/index.html";
    sessionStorage.removeItem(`${username}_token`);
})

socket.on("connect_error", (err) => {
    alert(err.message)
})

/* DOM Listeners*/

joinRoomButton.onclick = () => {
    const room = roomName.value;
    roomName.value = "";

    if (room.length !== 0) {
        socket.emit("joinRoom", {roomName: room, username});
    }

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

