import moment from "moment"

interface Message {
    text: string,
    createdAt: string
}


function genMessage(text: string): Message {
    return {
        text,
        createdAt: moment(new Date().getTime()).format("h:mm  a")
    }
}






export { Message, genMessage }