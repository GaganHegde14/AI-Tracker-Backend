import mongoose from "mongoose"

const aiChatsSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    chats: [
        {
            role: {
                type: String, // "user" | "assistant"
                required: true
            },
            content: {
                type: String,
                required: true
            }
        }
    ]
},
{
    timestamps: true
})

export const AiChat = mongoose.model("aiChat", aiChatsSchema)
