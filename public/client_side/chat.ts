import { io } from "socket.io-client"

// Sending a message
const socket = io("http://localhost:3000");

socket.on("message", (message: string) => {
    console.log(message);
})


// Reading and sending a message from the user
const form = document.querySelector("form") as HTMLFormElement;

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = document.querySelector("#message") as HTMLInputElement

    socket.emit("sendMessage", message.value);

    message.value = "";
})


// Reading and sending location
const sendLocationButton = document.querySelector("#sendLocation") as HTMLButtonElement

sendLocationButton.onclick = () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("sendLocation",{latitude, longitude});
    })
}