import { io } from "socket.io-client"

const socket = io("http://localhost:3000/", {
    auth: {
        token: "hello"
    }
});



// Elements
const joinForm = document.querySelector("#join-form") as HTMLFormElement;
const joinButton = joinForm.querySelector("button") as HTMLButtonElement;
const userName = joinForm.querySelector("#username") as HTMLInputElement;
const password = joinForm.querySelector("#password") as HTMLInputElement;


    
joinForm.onsubmit =  async (event) => {
    event.preventDefault();
    socket.emit("login", { username: userName.value, password: password.value });
    joinButton.setAttribute("disabled", "disabled"); 
}

socket.on("found", ({ token, username, _id }) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("_id", _id);
    joinForm.action = "./chat.html";
    joinForm.submit();
})

socket.on("login_error", (errMessage: string) => {
    joinButton.removeAttribute("disabled");
    userName.value = "";
    password.value = "";
    userName.placeholder = errMessage;
})

socket.on("already_logged_in", () => {
    joinButton.disabled = false;
    userName.value = "";
    password.value = "";
    userName.placeholder = "You are already logged in!"
})


socket.on("db_error", () => {
    alert("An error from our side, Reloading...");
    window.location.reload();
})