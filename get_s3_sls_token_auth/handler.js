// 'use strict';
const nanoid = require('nanoid');
// const redis = require('redis');

module.exports.gettoken = async (event) => {
  const DEFAULTCOUNT = 20;
  try {
    var redisSrv = require('./redis');
    //   const client = redis.createClient({
    //     host: "ec2-3-87-197-56.compute-1.amazonaws.com",
    //     port: 6379
    // });
    // client.on('ready', function(result) { 

    //   var red = sadd = (p1, ...args) => (new Promise((resolve, reject) => {
    //     client.sadd(p1, ...args, err => { if(err) { return reject(err) } resolve(); })
    //     console.log(p1, "_____________",args)
    //     // console.log( client.sismember(p1,arg[1])," ====sismember")
    // }));
    // })

    var tokens = [];
    var count = parseInt(event.queryStringParameters.count);
    count = isNaN(count) ? DEFAULTCOUNT : count;
    const userId = event.queryStringParameters.uid ? event.queryStringParameters.uid.trim() : undefined;

    if (!userId) { throw new Error("Missing parameters") }

    for (let i = 0; i < count; i++) {
      tokens.push(nanoid());
    }

    const key = `user_${userId}`;
    await redisSrv.sadd(key, ...tokens);
    var ii = await redisSrv.smembers(key)
    console.log("***********************", ii)

    // var response = {
    //     "statusCode": 200,
    //     "headers": {
    //       'Content-Type': 'application/json'
    //     },
    //     "body": JSON.stringify({ success: true, data: { tokens, count }},2,null),
    //     "isBase64Encoded": false
    // };
    // callback(null, response);
    return {
      statusCode: 200,
      // header:header,
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true, data: { tokens, count } }, null, 2),
    };

  } catch (err) {
    console.log(err, "erroe")
    // console.log(event,"event")
    //   var response = {
    //     "statusCode": 400,
    //     "headers": {
    //       'Content-Type': 'application/json'
    //     },
    //     "body": JSON.stringify({ success: false, data: { tokens:[], count:null }},2,null),
    //     "isBase64Encoded": false
    // };
    // callback(null, response);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
      // header:header,
      body: JSON.stringify({ success: false, error: "err" }, null, 2),
    };
  }

}
// module.exports.hello = async (event, context, callback) => {
//   console.log(event.pathParameters)
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless v1.0! Your function executed successfully!',
//       input: event.pathParameters,
//     }, null, 2),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
const generatePolicy = function (principalId, effect, resource, token) {

  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  authResponse.usageIdentifierKey = 'vPkhoGmkhx43S64cGD5ts3ai4vP1M5VW2pCtRED7'
  // console.log(authResponse, '+++++++policy', authResponse.policyDocument);
  return authResponse;
};

module.exports.auth = async (event, context, callback) => {
  var sda = require('./redis');
  // console.log('**********************************************',token,sda)
  // console.log(event.multiValueQueryStringParameters.token[0]);
  // console.log(event.multiValueQueryStringParameters.uid[0]);

  console.log("==================");
  console.log("==================");

  /*
  *44oyQX86hVGJhh8nG1Gzz  user_1565331390632
  * extra custom authorization logic here: OAUTH, JWT ... etc
  *
  */
  // const redis = require('redis');

  var token = event.multiValueQueryStringParameters.token[0];
  // console.log(redis)
  //  var sda = require('cors');

  // const token = event.multiValueQueryStringParameters.token[0] ? event.multiValueQueryStringParameters.token[0].trim() : undefined;
  // const userId = event.multiValueQueryStringParameters.uid[0] ? event.multiValueQueryStringParameters.uid[0].trim() : undefined;
  // const key = `user_${userId}`;
  // console.log("token = ",token,"key = ",key)
  // const tokenExists = await redisSrv.sismember(key, token);
  // console.log('Is Token exists? ', tokenExists);

  // var token_check_status = 'allow'
  // if(tokenExists === 0) {
  //   token_check_status = 'allow'
  //  }else{
  //   //  await redisSrv.srem(key, token).catch(e => console.log(e));
  //    token_check_status = 'allow'
  //  }
  console.log(token)
  switch (token) {
    case 'allow':
      callback(null, generatePolicy('user', 'Allow', event.methodArn, token));
      break;
    case 'deny':
      callback(null, generatePolicy('user', 'Deny', event.methodArn, token));
      break;
    case 'unauthorized':
      callback('Unauthorized');
      break;
    default:
      callback('Error');
  }
};

