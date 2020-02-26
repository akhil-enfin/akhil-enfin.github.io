'use strict';
const redis = require('redis');
const nanoid = require('nanoid');
var CryptoJS = require("crypto-js");
var myPassword = "akhilpassword";
// var ciphertext = CryptoJS.AES.encrypt('akhil', myPassword);
// var decrypted  = CryptoJS.AES.decrypt(ciphertext.toString(), myPassword);
// var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
// console.log(ciphertext.toString());


// var btoa = require('btoa');

var client;

function connectHandler(e) {
    console.log("Redis connected: " + e);
}

function closeHandler(e) {
    console.log("Redis connection closed: " + e);
}

function errorHandler(e) {
    console.log("Redis connection failed: " + e);
}

const generatePolicy = function (principalId, effect, resource) {
    const authResponse = {};
    authResponse.principalId = principalId;
    authResponse.usageIdentifierKey = 'ebkzOEJTxDN88lgz1Bda2iqZTexSKdU18fYSbJgh';
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

exports.auth = async (event) => {
    try {
        // console.log("=================");
        // console.log("Token: ", event.queryStringParameters.token);
        // console.log("=================");

        if (!client) {
            client = redis.createClient({
                host: "redis-research.ztt9xp.ng.0001.use1.cache.amazonaws.com",
                port: 6379
            });
        }

        client.off("error", errorHandler);

        client.off("end", closeHandler);

        client.off("connect", connectHandler);

        client.on("error", errorHandler);

        client.on("end", closeHandler);

        client.on('connect', function (result) { console.log("connected to redis server"); })

        // client.on("connect", connectHandler);


        const srem = (p1, ...args) => (new Promise((resolve, reject) => {
            client.srem(p1, ...args, (err, result) => { if (err) { return reject(err) } resolve(result); })
        }));

        const sismember = (p1, p2) => (new Promise((resolve, reject) => {
            client.sismember(p1, p2, (err, result) => { if (err) { return reject(err) } resolve(result); })
        }));

        const token = event.queryStringParameters.token ? event.queryStringParameters.token.trim() : undefined;
        const userId = event.queryStringParameters.uid ? event.queryStringParameters.uid.trim() : undefined;

        if (!token || !userId) { return 'Unauthorized'; }

        const key = `user_${userId}`;
        // console.log("key= ",key,"token = ",token)
        const tokenExists = await sismember(key, token);
        // console.log(tokenExists,"tokenExists")
        // In this example, the token is treated as the status for simplicity.
        switch (tokenExists) {
            case 1:
                 srem(key, token).catch(e => console.log(e))
                return generatePolicy('user', 'Allow', event.methodArn);
            case 0:
                return generatePolicy('user', 'Deny', event.methodArn);
            default:
                return 'Unauthorized';
        }
    } catch (e) {
        console.log(e)
    }
};

exports.gettoken = async (event) => {
    console.log("called get tiken")
    const DEFAULTCOUNT = 20;
    try {
        var encoded_tokens = ''
        var tokens = [];
        // var count = parseInt(event.queryStringParameters.count);
        // count = isNaN(count) ? DEFAULTCOUNT : count;
        var count = DEFAULTCOUNT
        const userId = event.queryStringParameters.uid ? event.queryStringParameters.uid.trim() : undefined;
        const SECONDSPERTOKEN = 180;
        if (!userId) { throw new Error("Missing parameters") }

        for (let i = 0; i < count; i++) {
            // tokens.push(nanoid());
        //    let add_j =  nanoid().replace(/a/g,'j');//convert all a to j
        //    let remove_j =  add_j.replace(/j/g,'a');//convert all j to a
        //    tokens.push(remove_j); 
        //     encoded_tokens = encoded_tokens + add_j + '/';
        let id  =  nanoid()
        var ciphertext = CryptoJS.AES.encrypt(id, myPassword);
        let encoded = ciphertext.toString()
        tokens.push(id); 

        encoded_tokens = encoded_tokens + encoded+")";
        
        console.log("encoded tokens=",encoded_tokens)

        }
        if (!client) {
            client = redis.createClient({
                host: "redis-research.ztt9xp.ng.0001.use1.cache.amazonaws.com",
                port: 6379
            });
        }

        client.off("error", errorHandler);

        client.off("end", closeHandler);

        client.off("connect", connectHandler);

        client.on("error", errorHandler);

        client.on("end", closeHandler);

        client.on("connect", connectHandler);

        const key = `user_${userId}`;
        var sadd = (p1, ...args) => (new Promise((resolve, reject) => {
            client.sadd(p1, ...args, err => { if (err) { return reject(err) } resolve(); })
        }));
        var expire = (p1, p2) => (new Promise((resolve, reject) => {
            client.expire(p1, p2, (err, result) => { if (err) { reject(err) } resolve(result); })
        }));
        await sadd(key, ...tokens);
        await expire(key, (SECONDSPERTOKEN * count));
        return {
            statusCode: 200,
            // header:header,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ success: true,analytics:encoded_tokens}),
        };

    } catch (err) {
        console.log(err,"err")
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            },
            // header:header,
            body: JSON.stringify({ success: false, error: err }, null, 2),
        };
    }

}