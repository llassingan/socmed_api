const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token:{
        type: String,
        required: true,
        unique: true
    },
    expiresAt:{
        type: Date,
        required: true
    }

}, {timesamps: true});

RefreshTokenSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);