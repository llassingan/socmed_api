const logger = require('../utils/logging');
const { validateRegistration,
        validateLogin
 } = require('../utils/validation');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const generateToken = require('../utils/generateToken');

// user registration
const registerUser =  async (req, res) =>{
    logger.info('Register user endpoint hit');
    try {
        const {error} = validateRegistration(req.body);
        if(error){
            logger.warn('Validation error: %s', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message});
        }
        const {username, email, firstname, lastname, password, role} = req.body;
        // check isexist
        const existingUser = await User.findOne({ $or: [{username}, {email}] });
        if(existingUser){
            logger.warn(`User already exists with username: ${username} or email: ${email}`);
            return res.status(409).json({
                success: false,
                message: 'Username or Email already exists'
            });
        }

        const newUser = new User({username, email, firstname, lastname, password, role});
        await newUser.save();
        const {accessToken, refreshToken} = await generateToken(newUser);
        logger.info('User registered successfully: %s', username);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        logger.error(`Error in user login: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }

}



// user login
const loginUser = async (req, res) => {
    logger.info('Login user endpoint hit');
    try {
        const {error} = validateLogin(req.body);
        if(error){
            logger.warn('Validation error: %s', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message});
        }

        const {username, password} = req.body;
        // remember the passsword is excluded in model
        const user = await User.findOne({username}).select('+password');;

        if(!user || !(await user.comparePassword(password))){
            logger.warn(`Invalid credentials for username: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const {accessToken, refreshToken} = await generateToken(user);
        logger.info('User logged in successfully: %s', username);
        return res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            tokens: {
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        logger.error(`Error in user login: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }

}



// refresh token
const refreshTokenUser = async (req, res) => {
    logger.info('Refresh token endpoint hit');
    try {
        const {refreshToken} = req.body;
        // validate refresh token
        if(!refreshToken){
            logger.warn('No refresh token provided');
            return res.status(400).json({
                success: false,
                message: 'No refresh token provided'
            });
        }
        // verify refresh token
        const storedToken = await RefreshToken.findOne({token: refreshToken});
        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn('Invalid or expired refresh token');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        const user = await User.findById(storedToken.userId);
        if(!user){
            logger.warn('User not found for the provided refresh token');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateToken(user);
        
        await RefreshToken.deleteOne({_id: storedToken._id}); // delete old refresh token
        
        logger.info('Token refreshed successfully for user: %s', user.username);
        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        logger.error(`Error in refresh token: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}



// user logout
const logoutUser = async (req, res) => {
    logger.info('Logout user endpoint hit');    
    try {
        const {refreshToken} = req.body;
        // validate refresh token
        if(!refreshToken){
            logger.warn('No refresh token provided');
            return res.status(400).json({
                success: false,
                message: 'No refresh token provided'
            });
        }
        await RefreshToken.deleteOne({token: refreshToken});
        logger.info('User logged out successfully');    
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });

        
    } catch (error) {
        logger.error(`Error in user login: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}



module.exports = {
    registerUser,
    loginUser,
    refreshTokenUser,
    logoutUser
}