let aws = require('aws-sdk')
let series = require('run-series')
let _logs = require('./_logs')

module.exports = function s3(inventory, callback) {
  let {header, notfound, error, found} = _logs(inventory)
  header('S3 Buckets')
  let s3 = new aws.S3
  series(inventory.s3buckets.map(Bucket=> {
    return function _getBucket(callback) {
      s3.headBucket({Bucket}, function _prettyPrint(err) {
        if (err && err.code === 'NotFound') {
          notfound(Bucket)
        }
        else if (err) {
          error(err.message)
        }
        else {
          found(Bucket, `arn:aws:s3:::${Bucket}`)
        }
        callback()
      })
    }
  }), callback)
}
