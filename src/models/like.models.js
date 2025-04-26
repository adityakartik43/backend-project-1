import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.type.ObjectId,
            ref:"Video"
        },
        comment: {
            type: Schema.type.ObjectId,
            ref:"Comment"
        },
        tweet: {
            type: Schema.type.ObjectId,
            ref:"Tweet"
        },
        likedBy: {
            type: Schema.type.ObjectId,
            ref:"User"
        },
    }, 
    {
        timestamps: true
    }
)

const Like = mongoose.model.Schema("Like", likeSchema)
export default Like;