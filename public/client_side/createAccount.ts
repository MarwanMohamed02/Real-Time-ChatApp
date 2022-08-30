import { io } from "socket.io-client"

const socket = io("http://localhost:3000/", {
    auth: {
        token: "hello"
    }
});


const signUpForm = document.getElementById("sign-up-form") as HTMLFormElement;
const userName = signUpForm.querySelector("#username") as HTMLInputElement;
const password = signUpForm.querySelector("#password") as HTMLInputElement;


signUpForm.onsubmit = (e) => {
    e.preventDefault();
    const username = userName.value;
    console.log(username);
    
    socket.emit("createNewUser", { username });
}


socket.on("user_created", ({ username, token }) => {
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("token", token);
    signUpForm.action = "./chat.html";
    signUpForm.submit();
})





