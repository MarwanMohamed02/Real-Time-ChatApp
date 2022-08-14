import { io } from "socket.io-client"

const socket = io("http://localhost:3000");

socket.on("sendMessage", (message: string) => {
    console.log(message);
})


const form = document.querySelector("form") as HTMLFormElement;

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = document.querySelector("#message") as HTMLInputElement

    socket.emit("sendMessage", message.value);

    message.value = "";
})

