const logger = require('../utils/logging')
const Media = require('../models/Media')
const {uploadMedia} = require('../utils/cloudinary')



const uploadMediaController = async (req, res) =>{
    logger.info('Upload media endpoint hit');
    try {

        if(!req.file){
            logger.warn('No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        // get standard header from the body
        const {originalname, mimetype} = req.file
        const userId = req.user.userId;
        logger.info(`File details: name=${originalname}, type=${mimetype}`)

        logger.info('Uploading media to cloudinary');
        const result = await uploadMedia(req.file);
        logger.info(`Media uploaded successfully: ${result.public_id}`);
        
        const newMedia = new Media({
            publicId: result.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: result.secure_url,
            userId: userId
        });
        await newMedia.save();
        logger.info(`Media saved successfully: ${newMedia._id}`);
        res.status(201).json({
            success: true,
            message: 'Media uploaded successfully',
            data: {
                id: newMedia._id,
                url: newMedia.url
            }
        });


    } catch (error) {
        logger.error(`Error when creating media: ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

const getAllMediaController = async (req, res) =>{
    logger.info('Get all media endpoint hit');
    try {
        const result = await Media.find({});
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error(`Error fetching media: ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}


module.exports = {
    uploadMediaController,
    getAllMediaController
}