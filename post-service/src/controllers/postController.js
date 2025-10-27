const logger = require('../utils/logging')
const {validatePost} = require('../utils/validation')
const Post = require('../models/Post')
const {invalidateCache} = require('../utils/Rediscaching')
const { publishMessage } = require('../utils/rabbitmq')



const createPost =  async(req, res) =>{
    try {
        const {error} = validatePost(req.body);
        if(error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message});
        }
        const {content, mediaIds} = req.body;
        const newPost =  await Post.addPost(String(req.user.userId), content, mediaIds)
        
        await publishMessage('post.created', { 
            postId: newPost.id.toString(), 
            userId: newPost.user,
            content: newPost.content,
            createdAt: newPost.createdAt
         });


        await invalidateCache(req,newPost.id.toString());
        logger.info(`Post created successfully: ${newPost.id.toString()}`);
        res.status(201).json({
            success: true,
            message: `Post ${newPost.id.toString()} created successfully`,
        });
        
    } catch (error) {
        logger.error(`Error in create post: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}


const getAllPosts =  async(req, res) =>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const cacheKey = `posts_${page}_limit_${limit}`;

        // if posts are in cache, serve from cache
        const cachedPosts = await req.redisClient.get(cacheKey);
        if(cachedPosts){
            logger.info('Serving posts from cache');
            const parsedPosts = JSON.parse(cachedPosts);
            return res.status(200).json({
                success: true,
                data: parsedPosts.posts,
                pagination: {
                    totalPosts: parsedPosts.totalPosts,
                    currentPage: parsedPosts.currentPage,
                    totalPages: parsedPosts.totalPages
                }
            });
        }

        //  if not in cache, fetch from database
        const posts = await Post.getAllPosts(skip, limit);
        
        const totalPosts = posts.length

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts
        }
        // cache the result for 5 minutes
        await req.redisClient.setex(cacheKey,300, JSON.stringify(result));
        
        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                totalPosts,
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit)
            }
        });
    } catch (error) {
        logger.error(`Error in fetshing all posts: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}


const getPost =  async(req, res) =>{
    try {
        const postId = req.params.id;
        const cacheKey = `post_${postId}`;
        // check cache first
        const cachedPost = await req.redisClient.get(cacheKey);
        if(cachedPost){
            logger.info(`Serving post ${postId} from cache`);
            const parsedPosts = JSON.parse(cachedPosts);
            return res.status(200).json({
                success: true,
                data: parsedPosts.posts
            });
        }
        const post = await Post.getPost(postId);
        if(!post){
            logger.warn(`Post not found: ${postId}`);
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        // cache the post for 10 minutes
        await req.redisClient.setex(cacheKey,3600, JSON.stringify(post));
        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        logger.error(`Error in fetching post: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

const deletePost =  async(req, res) =>{
    try {
        const postId = req.params.id;
        const post = await Post.deletePost(postId);
        if(!post){
            logger.warn(`Post not found: ${postId}`);
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        await publishMessage('post.deleted', { 
            postId: post.id.toString(), 
            userId: req.user.userId,
            mediaIds: post.mediaIds
         });

        await invalidateCache(req,postId);

        logger.info(`Post deleted successfully: ${postId}`);
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        logger.error(`Error in deleting post: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

const updatePost =  async(req, res) =>{
    try {
        const postId = req.params.id;
        const {error} = validatePost(req.body);
        if(error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message});
        }
        const {content} = req.body
        const post = await Post.updatePost(postId, content);

        if(!post){
            logger.warn(`Post not found: ${postId}`);
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        await invalidateCache(req,postId);
        logger.info(`Post updated successfully: ${postId}`);
        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
        });
    } catch (error) {
        logger.error(`Error in deleting post: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

module.exports ={
    createPost,
    getAllPosts,
    getPost,
    deletePost,
    updatePost

}