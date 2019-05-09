const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function memoize(fn) {
  const cache = {};
  return function(...args) {
    if (cache[args]) {
      return cache[args];
    }
    const result = fn.apply(this, args);
    cache[args] = result;
    return result;
  };
}

function slowFib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

const fib = memoize(slowFib);

sub.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)));
  console.log(fib(parseInt(message)));
});
sub.subscribe("insert");
