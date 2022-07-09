import mongoose from 'mongoose';
const {Schema, model} = mongoose;

const videoSchema = new Schema ({
    videoId: String,
    tags: [String],
    createdAt: Date,
    updatedAt: Date
}

);

const Video = model('Video', videoSchema);
export default Video;