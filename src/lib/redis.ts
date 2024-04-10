import Redis from 'ioredis';

const redisClient = new Redis(process.env.KV_URL as string);
redisClient.connect();
export default redisClient;
