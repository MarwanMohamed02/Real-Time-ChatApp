"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    currentRoom: {
        type: mongoose_1.Schema.Types.ObjectId
    }
});
const User = (0, mongoose_1.model)("User", UserSchema);
exports.User = User;
