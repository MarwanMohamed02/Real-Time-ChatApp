import moment from "moment"

interface Message {
    author: string,
    text: string,
    createdAt: string
}


function genMessage(text: string, author: string): Message {
    return {
        author,
        text,
        createdAt: moment(new Date().getTime()).format("h:mm  a")
    }
}






export { Message, genMessage }