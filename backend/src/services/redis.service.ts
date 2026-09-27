export const getRedisClient = () => {
    // get existing redis client from queue.service if possible, or create a new one
    return new (require('ioredis'))(process.env.REDIS_URL || 'redis://localhost:6380', { maxRetriesPerRequest: null });
};
