import { UserDocument } from "../db/models/userModel"

export type Search = {
    user: UserDocument | null,
    error: Error | undefined
}