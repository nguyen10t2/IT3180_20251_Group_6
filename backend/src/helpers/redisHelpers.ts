import Elysia from 'elysia';
import Redis from 'ioredis';

const client = new Redis(process.env.UPSTASH_REDIS_URL!);
await client.set("foo", "bar", "EX", 60);
console.log(await client.get("foo"));

export default client;
export const redisPlugin = new Elysia().decorate('redis', client);