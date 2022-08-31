import moment from "moment"
import { IUser, UserDocument } from "../db/models/userModel"


type Author = {
    _id?: string,
    name: string
}

interface Message {
    author: Author,
    text: string,
    createdAt: string
}


function genMessage(text: string, user?: UserDocument): Message {

    const author: Author = {
        _id: user?._id.toString(),
        name: user? user.username : "Admin"
    }

    return {
        author,
        text,
        createdAt: moment(new Date().getTime()).format("h:mm  a")
    }
}






export { Message, genMessage }