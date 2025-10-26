const express = require('express')

const {createPost, getAllPosts, getPost, deletePost, updatePost} = require('../controllers/postController')
const authenticateReq = require('../middlewares/authMiddleware')


const router = express.Router()

// auth middleware
router.use(authenticateReq)

// routes 
router.post('/create-post',createPost)
router.get('/allposts',getAllPosts)
router.get('/:id',getPost)
router.delete('/:id',deletePost)
router.put('/:id',updatePost)


module.exports = router;
