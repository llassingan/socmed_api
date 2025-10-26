

invalidateCache = async (req,input) => {
    const keys = await req.redisClient.keys("posts_*");
    if(keys.length >0){
        await req.redisClient.del(keys);
    }
    await req.redisClient.del(`post_${input}`);

    //delete all search
    const keywords = await req.redisClient.keys("searh_key_*");
    if(keywords.length >0){
        await req.redisClient.del(keywords);
    }
}

module.exports = {
    invalidateCache
}