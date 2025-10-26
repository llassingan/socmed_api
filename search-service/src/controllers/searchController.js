const logger = require("../utils/logging");
const SearchPost = require('../models/search')


const searchPost = async (req, res) =>{
    logger.info('search post endpoint hit')
    try {
        const {query} = req.query;
        const cacheKey = `searh_key_${query}`;

        // if search are in cache, serve from cache
        const cachedSearch = await req.redisClient.get(cacheKey);
        if(cachedSearch){
            logger.info('Serving search from cache');
            const parsedSearch = JSON.parse(cachedSearch);
            return res.status(200).json({
                success: true,
                data: parsedSearch,
                
            });
        }
        const result = await SearchPost.find(
            {
                $text: {$search: query}
            },
            {
                score: {$meta: 'textScore'}
            }
        
        ).sort({score: {$meta: 'textScore'}}).limit(10)
        // store to redis
        await req.redisClient.setex(cacheKey,180, JSON.stringify(result));
        res.status(200).json({
            success: true,
            data: result
        })

    } catch (error) {
        logger.error(`Error while searching post: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}



module.exports= {
    searchPost
}