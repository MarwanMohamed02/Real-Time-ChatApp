import Stack from "../utils/Stack"

const { Status } = sessionStorage;

console.log("Status: " + Status);

if (!Status) {
    let { storedTokens } = localStorage;
    if (storedTokens) {
        console.log(storedTokens);
        let tokens = new Stack<string>(JSON.parse(storedTokens));
        console.log("stored tokens: ");
        console.log(tokens);
        if (!tokens.isEmpty()) {
            const lastToken = tokens.pop();
            console.log(tokens);
            sessionStorage.setItem("token", lastToken);
            localStorage.setItem("token", JSON.stringify(tokens))
            document.location.href = "/chat.html";
        }
    }
    else {
        let storedTokens = new Stack<string>({});
        console.log(storedTokens.arr);
        localStorage.setItem("storedTokens", JSON.stringify(storedTokens));
    }
}

// localStorage.removeItem("token");
// localStorage.removeItem("storedTokens")

// console.log(localStorage.getItem("token"), localStorage.getItem("storedTokens"));
