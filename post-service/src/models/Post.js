const { PrismaClient } = require("@prisma/client");

const logger = require('../utils/logging')

const prisma = new PrismaClient();


const addPost = async (user, content, mediaIds) => {
    try {
        const post = await prisma.post.create({
            data: {
                user,
                content,
                mediaIds
            }
        });
        return post;
    } catch (error) {
        logger.error(error)
    }
}


const getAllPosts = async (skip, limit) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
              createdAt: 'desc',
            },
            skip: skip,
            take: limit,
          });
        return posts;
    } catch (error) {
        logger.error(error)
    }
}


const getPost = async (postId) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });
        if (post) {
            return post;
        }
        return null;
    } catch (error) {
        logger.error(error)
    }
}


const updatePost = async (postId, content, mediaIds) => {
    try {
        const updatedPost = await prisma.$transaction(
            async (tx) => {
                const isExist = await tx.post.findUnique({
                    where: {
                        id: postId
                    }
                });

                if (!isExist) {
                    return null
                }
                return await tx.post.update({
                    where: {
                        id: postId
                    },
                    data: {
                        content,
                        mediaIds
                    }
                });

            })
        return updatedPost;
    } catch (error) {
        logger.error(error)
    }

}

const deletePost = async (postId) => {
    try {
        const deletePost = await prisma.$transaction(
            async (tx) => {
                const isExist = await tx.post.findUnique({
                    where: {
                        id: postId
                    }
                });

                if (!isExist) {
                    return null
                }
                return await tx.post.delete({
                    where: {
                        id: postId
                    }
                });

            })
        return deletePost;
    } catch (error) {
        logger.error(error)
    }
}



module.exports ={
    addPost,
    getAllPosts,
    getPost,
    updatePost,
    deletePost
}