const logger = require("../utils/logging")
const SearchPost = require('../models/search')


const handlePostCreated = async (event) => {
    logger.info(`event: ${event}`)
    const {postId, userId, content, createdAt} = event
    try {
        logger.info(`Adding post : ${postId} to search database`)
        const newPost = new SearchPost({
            postId,
            userId,
            content,
            createdAt
        }) 
        await newPost.save()
        logger.info(`Post ${postId} added successfully: ${newPost._id.toString()}`)
    
    } catch (error) {
        logger.error(`Error in handle post.created event: ${error}`)
    }
}

const handlePostDeleted = async (event) => {
    logger.info(`event: ${event}`)
    const {postId} = event
    try {
        logger.info(`Deteling post post : ${postId} to search database`)
        const deleted = await SearchPost.findOneAndDelete({postId})
        logger.info(`Post ${postId} deleted successfully`)
    
    } catch (error) {
        logger.error(`Error in handle post.created event: ${error}`)
    }
}

module.exports = {
    handlePostCreated,
    handlePostDeleted
}