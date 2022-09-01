import mongoose from "mongoose"

const url = "mongodb://127.0.0.1:27017/chat-api";

export async function connect_to_db() {
    await mongoose.connect(url);
}
