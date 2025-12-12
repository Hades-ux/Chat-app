import { createClient } from "redis";
import { configDotenv } from "dotenv";
configDotenv();

const redis = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    tls: {
      rejectUnauthorized: false,
    },
  },
});

redis.on("connect", () => console.log("\nRedis Cloud connected"));
redis.on("error", (err) => console.error(" Redis error:", err));

export default redis;
