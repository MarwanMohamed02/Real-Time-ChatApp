import { io } from "socket.io-client"

const socket = io( {
    auth: {
        token: "hello"
    }
});


const signUpForm = document.getElementById("sign-up-form") as HTMLFormElement;
const userName = signUpForm.querySelector("#username") as HTMLInputElement;
const password = signUpForm.querySelector("#password") as HTMLInputElement;


signUpForm.onsubmit = (e) => {
    e.preventDefault();
       
    socket.emit("createNewUser", { username: userName.value, password: password.value });
}


socket.on("user_created", ({ username, token, _id }) => {
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("_id", _id)
    signUpForm.action = "./chat.html";
    signUpForm.submit();
})

socket.on("duplicate_user_error", () => {
    userName.value = "";
    password.value = "";

    userName.placeholder = "This username is already taken..."
})


socket.on("db_error", () => {
    alert("An error from our side, Reloading...");
    window.location.reload();
})


