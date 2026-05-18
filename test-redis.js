const { Redis } = require('@upstash/redis');

async function test() {
  const redis = new Redis({
    url: "https://generous-opossum-21795.upstash.io",
    token: "AVUjAAIncDEyNTZkMjEyNTMxNzE0MjllOWRmMWZjZDdiYTIyZjZkOHAxMjE3OTU",
  });
  
  console.log('Testing Upstash Redis latency...');
  const start = performance.now();
  try {
    const res = await redis.get('startup_stats');
    console.log('Redis GET: ' + (performance.now() - start) + 'ms');
  } catch (err) {
    console.error('Redis error: ' + (performance.now() - start) + 'ms', err);
  }
}
test();
