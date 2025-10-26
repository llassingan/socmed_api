const logger = require("../utils/logging")
const Media = require("../models/Media")
const { deleteMedia } = require("../utils/cloudinary")


const handlePostDeleted = async (event) => {
    logger.info(`event: ${event}`)
    const {postId, mediaIds} = event
    try {
        const mediaToDelete = await Media.find({
            _id: {
                $in: mediaIds
            }
        })
        logger.info(`Starting to delete all media from Post: ${postId}`)
        for (const media of mediaToDelete){
            logger.info(`Deleting media: ${media._id} with public id: ${media.publicId}`)
            await deleteMedia(media.publicId)
            await Media.findByIdAndDelete(media._id)
            logger.info(`Media deleted successfully: ${media._id}`)
        }
        logger.info(`All media from Post: ${postId} deleted successfully`)

    } catch (error) {
        logger.error(`Error in handle post.deleted event: ${error}`)
    }
}

module.exports = {
    handlePostDeleted
}