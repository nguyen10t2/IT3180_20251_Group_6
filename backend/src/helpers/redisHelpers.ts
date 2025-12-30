import Elysia from "elysia";
import Redis from "ioredis";

const client = new Redis(Bun.env.UPSTASH_REDIS_URL!);

client.on("error", (err) => {
  console.error("Redis error:", err);
});

export default client;
export const redisPlugin = new Elysia().decorate("redis", client);