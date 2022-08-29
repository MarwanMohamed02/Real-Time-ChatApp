import { Schema, Document, Model, model } from "mongoose"
import jwt from "jsonwebtoken"

// to validate the user in the code
interface IUser {
    username: string, 
    currentRoom?: Schema.Types.ObjectId,
    token?: string,
}

// how the document looks in the db
interface UserDocument extends IUser, Document {
    genToken(): Promise<string>,
    logOut(): Promise<void>,
}


// the model that defines the functions that can be done
interface UserModel extends Model<UserDocument> {

}

const UserSchema = new Schema<UserDocument, UserModel>({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    currentRoom: {
        type: Schema.Types.ObjectId,
        ref: "Room"
    },
    token: {
        type: String
    }
},
    {
        toJSON: { getters: true, virtuals: true },
        toObject: { virtuals: true },
    }
)


// Methods
UserSchema.methods.genToken = async function(this: UserDocument) {
    this.token = jwt.sign({ _id: this._id.toString() }, "vehyhgehguufju8");

    await this.save();

    return this.token;
}

UserSchema.methods.logOut = async function (this: UserDocument) {
    this.token = undefined;
    await this.save();
}

const User = model<UserDocument, UserModel>("User", UserSchema);


export { User, IUser, UserDocument }