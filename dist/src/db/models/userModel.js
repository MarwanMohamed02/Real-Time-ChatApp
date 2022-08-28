"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    currentRoom: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Room"
    },
    token: {
        type: String
    }
}, {
    toJSON: { getters: true, virtuals: true },
    toObject: { virtuals: true },
});
// Methods
UserSchema.methods.genToken = async function () {
    this.token = jsonwebtoken_1.default.sign({ _id: this._id.toString() }, "vehyhgehguufju8");
    await this.save();
    return this.token;
};
UserSchema.methods.logOut = async function () {
    this.token = undefined;
    await this.save();
};
const User = (0, mongoose_1.model)("User", UserSchema);
exports.User = User;
