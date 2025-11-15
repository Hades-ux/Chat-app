import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    connection:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
},{timestamps: true})

export default mongoose.model("Connection", connectionSchema)