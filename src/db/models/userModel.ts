import { Schema, Document, Model, model } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { Search } from "../../utils/searchType"


// to validate the user in the code
interface IUser {
    username: string, 
    password: string,
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
    login(username: string, password: string): Promise<Search>,
}

const UserSchema = new Schema<UserDocument, UserModel>({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
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
    this.token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET as string);

    await this.save();

    return this.token;
}


UserSchema.methods.logOut = async function (this: UserDocument) {
    this.token = undefined;
    await this.save();
}

// Statics
UserSchema.statics.login = async function (username: string, password: string): Promise<Search> {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { error: new Error("Username or password are incorrect"), user: null };
    }

    return { user, error: undefined };
}


// Middleware
UserSchema.pre<UserDocument>("save", async function () {
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 12);
})



const User = model<UserDocument, UserModel>("User", UserSchema);


export { User, IUser, UserDocument }