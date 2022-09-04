import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const videoSchema = new Schema({
    videoId: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
    updatedAt: Date
}

);

const Video = model('Video', videoSchema);
export default Video;