import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
    {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        priority: {
            type: String,
            required: true,
            trim: true
        },
        steps: {
            type: [String],
            required: true
        },
        timeEstimate: {
            type: String,
            required: true,
            trim: true
        },
        improvedText: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['Completed', 'In Progress', 'Pending' , 'Hold'],
            default: 'Pending',
            required: true
        },

    },
    {
        timestamps: true
    })

export const Task = mongoose.model("task", taskSchema)    