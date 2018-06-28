let aws = require('aws-sdk')
let series = require('run-series')
let _logs = require('./_logs')

module.exports = function lambdas(inventory, callback) {
  let {header, notfound, error, found} = _logs(inventory)
  header(`Lambda Functions (${inventory.lambdas.length})`)
  let lambda = new aws.Lambda
  series(inventory.lambdas.map(FunctionName=> {
    return function _getLambda(callback) {
      lambda.getFunction({FunctionName}, function _prettyPrint(err, result) {
        if (err && err.code === 'ResourceNotFoundException') {
          notfound(FunctionName)
        }
        else if (err) {
          error(err.message)
          console.log(err)
        }
        else {
          found(FunctionName, result.Configuration.FunctionArn)
        }
        callback()
      })
    }
  }), callback)
}
