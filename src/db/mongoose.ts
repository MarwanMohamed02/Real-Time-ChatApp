import mongoose from "mongoose"

const url = process.env.MONGODB_URL as string;

export async function connect_to_db() {
    await mongoose.connect(url);
}
