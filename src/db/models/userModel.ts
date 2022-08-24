import { Schema, Document, Model, model } from "mongoose"

// to validate the user in the code
interface IUser {
    username: string, 
    currentRoom?: Schema.Types.ObjectId,

}

// how the document looks in the db
interface UserDocument extends IUser, Document {

}


// the model that defines the functions that can be done
interface UserModel extends Model<UserDocument> {

}

const UserSchema = new Schema<UserDocument, UserModel>({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    currentRoom: {
        type: Schema.Types.ObjectId
    }

})


const User = model<UserDocument, UserModel>("User", UserSchema);


export { User, IUser }