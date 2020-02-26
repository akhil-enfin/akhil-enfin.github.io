const redis = require('redis');

// const client = redis.createClient({
//   host: process.env.CS_REDISHOST,
//   port: process.env.CS_REDISPORT
// });
const client = redis.createClient({
    host: "redis-research.ztt9xp.ng.0001.use1.cache.amazonaws.com",
    port: 6379
});
client.on('connect', function(result) { console.log("connected to redis server"); })

client.on("error", function (e) {
    console.log("Redis connection failed: " + e);
});

client.on("end", function (e) {
    console.log("Redis connection closed: " + e);
});

module.exports.hset = (p1, p2, p3) => (new Promise((resolve, reject) => {
    client.hset(p1, p2, p3, err => { if (err) { reject(err) } resolve(); })
}));

module.exports.hdel = (p1, p2) => (new Promise((resolve, reject) => {
    client.hdel(p1, p2, err => { if (err) { reject(err) } resolve(); })
}));

module.exports.hgetall = (p1) => (new Promise((resolve, reject) => {
    client.hgetall(p1, (err, result) => { if (err) { reject(err) } resolve(result); })
}));

module.exports.hget = (p1, p2) => (new Promise((resolve, reject) => {
    client.hget(p1, p2, (err, result) => { if (err) { reject(err) } resolve(result); })
}));

module.exports.sadd = (p1, ...args) => (new Promise((resolve, reject) => {
    client.sadd(p1, ...args, err => { if(err) { return reject(err) } resolve(); })
    // console.log(p1, "_____________",args)
    // console.log( client.sismember(p1,arg[1])," ====sismember")
}));

module.exports.sismember = (p1, p2) => (new Promise((resolve, reject) => {
    client.sismember(p1, p2, (err, result) => { if (err) { reject(err) } resolve(result); })
}));

module.exports.srem = (p1, ...args) => (new Promise((resolve, reject) => {
    client.srem(p1, ...args, (err, result) => { if (err) { reject(err) } resolve(result); })
}));

module.exports.smembers = (p1) => (new Promise((resolve, reject) => {
    client.smembers(p1, (err, result) => { if (err) { reject(err) } return resolve(result); })
}));

module.exports.expire = (p1, p2) => (new Promise((resolve, reject) => {
    client.expire(p1, p2, (err, result) => { if (err) { reject(err) } resolve(result); })
}));