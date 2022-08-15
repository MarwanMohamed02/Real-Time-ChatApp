import moment from "moment"

interface Message {
    msg: string,
    createdAt: string
}


function genMessage(msg: string): Message {
    return {
        msg,
        createdAt: moment(new Date().getTime()).format("h:mm  a")
    }
}






export { Message, genMessage }