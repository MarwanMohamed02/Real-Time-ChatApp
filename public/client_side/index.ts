import { eventNames } from "process";
import { io } from "socket.io-client"

const socket = io("http://localhost:3000/");



// Elements
const joinForm = document.querySelector("#join-form") as HTMLFormElement;
const joinButton = joinForm.querySelector("button") as HTMLButtonElement;
const userName = joinForm.querySelector("#username") as HTMLInputElement;
const room = joinForm.querySelector("#room") as HTMLInputElement;


    
joinForm.onsubmit =  async (event) => {
    event.preventDefault();
    socket.emit("login", { username: userName.value });
    joinButton.setAttribute("disabled", "disabled");
    
   
}

socket.on("found", () => {
    joinForm.action = "./chat.html";
    joinForm.submit();
})

socket.on("notFound", () => {
    joinButton.removeAttribute("disabled");
    userName.value = "";
    userName.placeholder = "username not found... try again";
})
