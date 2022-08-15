import { io } from "socket.io-client"
import mustache from "mustache"
import { genMessage, Message } from "../../src/utils/messages"

const socket = io("http://localhost:3000");


/* Fetching Elements */

const feed = document.querySelector("#feed") as HTMLDivElement;

// Message Form Elements
const form = document.querySelector("form") as HTMLFormElement;
const message = form.querySelector("#message") as HTMLInputElement;
const sendMessageButton = form.querySelector("#sendMessage") as HTMLButtonElement;

// Location elements
const sendLocationButton = document.querySelector("#sendLocation") as HTMLButtonElement;

// Mustache templates
const messageTemplate = document.querySelector("#message-template")?.innerHTML as string;
const locationMessageTemplate = document.querySelector("#location-message-template")?.innerHTML as string


/* Server Listeners */

// Sending a message
socket.on("message", (message: Message) => {
    let updatedHTML = mustache.render(messageTemplate, message);
    feed.insertAdjacentHTML("beforeend",updatedHTML);
})

socket.on("sendLocationMessage", (url: Message) => {
    let updatedHTML = mustache.render(locationMessageTemplate, url);
    feed.insertAdjacentHTML("beforeend", updatedHTML);
})


/* DOM Listeners*/

// Reading and sending a message from the user
form.addEventListener("submit", (event) => {
    event.preventDefault();

    
    // disabling the button to prevent multiple sends
    sendMessageButton.setAttribute("disabled", "disabled");

    // sending message to the users
    socket.emit("sendMessage", message.value, (msg: string) => {
        console.log(msg);
        sendMessageButton.removeAttribute("disabled");
    });

    // resetting after sending message
    message.value = "";
    message.focus();
})


// Sending location
sendLocationButton.onclick = function () {
    
    sendLocationButton.setAttribute("disabled", "disabled");
    
    if (!navigator.geolocation) {
        sendLocationButton.removeAttribute("disabled");
        return alert("Geolocation is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("sendLocation", {latitude, longitude}, (msg: string) => {
            sendLocationButton.removeAttribute("disabled");
            console.log(msg)
        });
    })
}