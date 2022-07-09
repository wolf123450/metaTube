import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_PROD_URI)
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));


export default mongoose

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));