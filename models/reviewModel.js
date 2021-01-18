import mongoose from 'mongoose';


const reviewSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true
})

//const User = mongoose.model('User', userSchema);

export default reviewSchema;