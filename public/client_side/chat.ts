import { io } from "socket.io-client"
import mustache from "mustache"
import { Message } from "../../src/utils/messages"
import { IUser } from "../../src/db/models/userModel"
import { IRoom, RoomDocument } from "../../src/db/models/roomModel"
import { autoScroll } from "../utils/autoScroll"


const { token, username, _id, room, status } = sessionStorage;

const socket = io("http://localhost:3000", {
    auth: {
        token
    }
});

console.log(room, status);
socket.emit("user_in_lobby");


/* Fetching Elements */

// Center Elements
const feed = document.querySelector("#feed") as HTMLDivElement;
const currentRoomName = document.getElementById("current-room-name") as HTMLDivElement;

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
joinRoomButton.disabled = true;
const roomName = document.querySelector("#room-name") as HTMLInputElement;

const activeRoomsList = document.getElementById("active-rooms-list") as HTMLDivElement;

const createRoomButton = document.getElementById("create-room-button") as HTMLButtonElement;
createRoomButton.disabled = true;
const newRoomName = document.getElementById("new-room-name") as HTMLInputElement;

const leaveRoomButton = document.querySelector("#leave-room-button") as HTMLButtonElement;
leaveRoomButton.disabled = true;
const logoutButton = document.querySelector("#logout-button") as HTMLButtonElement;


// Mustache templates
const adminMessageTemplate = document.getElementById("admin-message-template")?.innerHTML as string
const messageTemplate = document.querySelector("#message-template")?.innerHTML as string;
const locationMessageTemplate = document.querySelector("#location-message-template")?.innerHTML as string;
const currentRoomNameTemplate = document.getElementById("current-room-name-template")?.innerHTML as string
currentRoomName.innerHTML = mustache.render(currentRoomNameTemplate, { currentRoomName: "Lobby" });
const roomatesListTemplate = document.getElementById("roomates-list-template")?.innerHTML as string;
const activeRoomsListTemplate = document.getElementById("active-rooms-list-template")?.innerHTML as string;

sendMessageButton.disabled = true;
sendLocationButton.disabled = true;


/* Server Listeners */

// Sending a message
socket.on("message", (message: Message) => {
    
    const { author, text, createdAt } = message;
    let { name } = author;
    
    const template = author.name === "Admin" ? adminMessageTemplate : messageTemplate;
    const style = author._id === _id ? "current-user-message" : "message";
    name = style === "current-user-message" ? "You" : name;


    let updatedHTML = mustache.render(template, { name, text, createdAt, style });
    feed.insertAdjacentHTML("beforeend", updatedHTML);
    
    autoScroll(feed);
})

// Sending a location message
socket.on("sendLocationMessage", (url: Message) => {

    const { author, text, createdAt } = url;
    let { name } = author;

    const style = author._id === _id ? "current-user-message" : "message";
    name = style === "current-user-message" ? "You" : name;

    let updatedHTML = mustache.render(locationMessageTemplate, { name, text, createdAt, style });
    feed.insertAdjacentHTML("beforeend", updatedHTML);

    autoScroll(feed);
})

socket.on("loadMessages", (messages: Message[]) => {

    feed.innerHTML = "";
    for (let i = 0; i < messages.length; i++) {
        const { author, text, createdAt } = messages[i];
        let { name } = author;

        const template = text.includes("https://google.com/maps") ? locationMessageTemplate : messageTemplate;
            
        const style = author._id === _id ? "current-user-message" : "message";
        name = style === "current-user-message" ? "You": name;
        
        let updatedHTML =  mustache.render(template, { name, text, createdAt, style });
        feed.insertAdjacentHTML("beforeend", updatedHTML);
    }

    feed.scrollTop = feed.scrollHeight;

    sendMessageButton.disabled = false;
    sendLocationButton.disabled = false;

})

socket.on("room_found", (room: string) => {
    sessionStorage.setItem("requestedRoom", room);
    socket.emit("leaveRoom");     
})

socket.on("user_joined_room", (room: string) => {
    leaveRoomButton.disabled = false;
    // feed.innerHTML = "";
    sessionStorage.setItem("room", room);
    //sessionStorage.removeItem("requestedRoom");

    currentRoomName.innerHTML = mustache.render(currentRoomNameTemplate, { currentRoomName: room });

    message.focus();
})

socket.on("user_created_room", (new_room_name: string) => {

    if (sessionStorage.getItem("room")) {
        sessionStorage.setItem("requestedRoom", new_room_name);
        socket.emit("leaveRoom");
    }
    else {
        socket.emit("joinRoom", { roomName: new_room_name, username });
    }

    newRoomName.value = "";
    message.focus();
    // window.location.reload();
})

socket.on("user_returned", (room: RoomDocument) => {
    leaveRoomButton.disabled = false;
    currentRoomName.innerHTML = mustache.render(currentRoomNameTemplate, { currentRoomName: room.name });
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
    if (activeRooms.length === 0)
        activeRooms[0] = { name: "~ Create the first room ~" };
        
    const updatedHTML = mustache.render(activeRoomsListTemplate, { activeRooms });
    activeRoomsList.innerHTML = updatedHTML;
})

socket.on("user_left_room", () => {
    sessionStorage.removeItem("room");

    const { requestedRoom, status } = sessionStorage;

    console.log(requestedRoom, status);
    
    if (status === "logout") {
        sessionStorage.removeItem("status");
        return socket.emit("logout", token);
    }
    else if (!requestedRoom) {
        roomName.placeholder = "Enter a room to join...";
        currentRoomName.innerHTML = mustache.render(currentRoomNameTemplate, { currentRoomName: "Lobby" });
        usersList.innerHTML = ""
        feed.innerHTML = "";
        sendMessageButton.disabled = true;
        sendLocationButton.disabled = true;
        window.location.reload();
    }
    else {
        socket.emit("joinRoom", { roomName: requestedRoom, username });
        sessionStorage.removeItem("requestedRoom");
        window.location.reload();
    }
})

socket.on("loggedOut", () => {
    document.location.href = "./";
})

socket.on("room_not_found", (room: string) => {
    
    roomName.value = "";
    roomName.placeholder = `${room} does not exist`;
})

socket.on("duplicate_room_error", () => {
    newRoomName.value = "";
    newRoomName.placeholder = "Room already exists...";
    createRoomButton.disabled = false;
})

socket.on("connect_error", (err) => {
    alert(err.message);
    document.location.href = "./"
})

/* DOM Listeners*/

roomName.oninput = (e) => {
    e.preventDefault();

    if (roomName.value.length === 0) {
        joinRoomButton.disabled = true;
        roomName.placeholder = "Enter a room to join...";
    }
    else if (joinRoomButton.disabled)
        joinRoomButton.disabled = false;
}

joinRoomButton.onclick = async (e) => {
    e.preventDefault();
    let currentRoom = sessionStorage.getItem("room");
    console.log("join room button pressed");

    joinRoomButton.disabled = true;

    if (currentRoom && currentRoom === roomName.value) {
         roomName.value = "";
         roomName.placeholder = "You are already in this room";
     }
    else if (!currentRoom) {
        socket.emit("joinRoom", { roomName: roomName.value, username });
        roomName.value = "";
        roomName.placeholder = "Enter a room to join...";
    }
    else {    
        socket.emit("findRoom", roomName.value);
        // sessionStorage.setItem("requestedRoom", roomName.value);
    }
}


leaveRoomButton.onclick = (e) => {
    e.preventDefault();
    console.log("leave room button pressed");

    socket.emit("leaveRoom");
    leaveRoomButton.disabled = true;
}


newRoomName.oninput = (e) => {
    e.preventDefault();
    if (newRoomName.value.length === 0) {
        createRoomButton.disabled = true;
    }
    else if (createRoomButton.disabled)
        createRoomButton.disabled = false;
}
createRoomButton.onclick = (e) => {
    e.preventDefault();
    console.log("create room button pressed");

    createRoomButton.disabled = true;
    
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
logoutButton.onclick = (e) => {
    console.log("logout button pressed");

    e.preventDefault();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("_id");

    if (sessionStorage.getItem("room")) {
        socket.emit("leaveRoom");
        sessionStorage.setItem("status", "logout");
    }
    else
        socket.emit("logout", token);
}


socket.on("db_error", () => {
    alert("An error from our side, Reloading...");
    window.location.reload();
})

