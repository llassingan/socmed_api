const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    content:{
        type : String,
        required : true,
    },
    mediaIds: [{
        type : String,
        required : false,
    }],
    createdAt : {
        type: Date,
        default: Date.now
    }

},{timestamps: true})

PostSchema.index({content: 'text'})



module.exports = mongoose.model('Post', PostSchema);