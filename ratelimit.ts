import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// Create a singleton Redis client install to take to upstash instance 
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
// 5 request per 10 seconds per IP
//create  reate engin  which mean logic  how to handl requst
export const authRatelimit = new Ratelimit({
  redis,// used to  store counter   which mean number of request
  limiter: Ratelimit.slidingWindow(5, "10 s"),// add timestamp
  analytics: true,// for  get information about   how many  requst is doen who is blocked  and  other log information 
});
