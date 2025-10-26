const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const generateToken = async (user) => {
    const accessToken = jwt.sign({
        id: user._id,
        username: user.username,
        role: user.role
    }, process.env.JWT_SECRET, {expiresIn: '15m'}); // for development purposes, set to 30 minutes
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpiry = new Date(); 
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)// 7 days 
    await RefreshToken.create({
        token: refreshToken,
        userId: user._id,
        expiresAt: refreshTokenExpiry
    })
    return {accessToken, refreshToken};    
}


module.exports = generateToken;


