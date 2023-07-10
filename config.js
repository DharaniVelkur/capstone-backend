const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey:process.env.SECRETACCESSKEY,
    region: 'us-east-1',
});

module.exports = {
    s3
}