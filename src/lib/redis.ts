import Redis from 'ioredis';

console.log(process.env.KV_URL);
const redisClient = new Redis(process.env.KV_URL as string);
redisClient.connect();
export default redisClient;
