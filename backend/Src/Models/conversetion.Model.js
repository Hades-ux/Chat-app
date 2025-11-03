import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    particepents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:  "User",
        required: true,
    
    }],

    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Message"

    }],

    isBlock:{
        type: Boolean,
        default: false,
    },

    blockedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})


export default mongoose.model("Coversation", conversationSchema)