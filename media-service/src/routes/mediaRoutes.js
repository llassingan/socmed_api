const express = require('express')
const multer = require('multer')

const {uploadMediaController, getAllMediaController} = require('../controllers/mediaController')
const authReq = require('../middlewares/authMiddleware')
const logger = require('../utils/logging')

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024} // 5mb
}).single('file')

router.post(
    '/upload', 
    authReq,
    // multer for server upload
    (req, res,next)=> {
        upload(req, res, (err) => {
            if(err instanceof multer.MulterError){
                logger.error(`Multer error while uploading media ${err}`)
                return res.status(400).json({
                    success: false,
                    message: `Multer error while uploading media`,
                    error:  err.message,
                    stack: err.stack
                });
            }else if(err){
                logger.error(`Error while uploading media ${err}`)
                return res.status(400).json({
                    success: false,
                    message: `Error while uploading media`,
                    error:  err.message,
                    stack: err.stack
                });
            }
            if (!req.file){
                logger.warn('No file uploaded')
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }
            next()
        })
    },
    // cloudinary handler for cloud storage upload 
    uploadMediaController)

router.get('/all-media', authReq,getAllMediaController)

module.exports = router