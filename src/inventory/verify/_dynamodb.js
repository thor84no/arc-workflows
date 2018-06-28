let aws = require('aws-sdk')
let series = require('run-series')
let _logs = require('./_logs')

module.exports = function tables(inventory, callback) {
  let {header, notfound, error, found} = _logs(inventory)
  header(`DynamoDB Tables`)
  let db = new aws.DynamoDB
  series(inventory.tables.map(TableName=> {
    return function _getLambda(callback) {
      db.describeTable({TableName}, function _prettyPrint(err, result) {
        if (err && err.code === 'ResourceNotFoundException') {
          notfound(TableName)
        }
        else if (err) {
          error(err.message)
          console.log(err)
        }
        else {
          found(TableName, result.Table.TableArn)
        }
        callback()
      })
    }
  }), callback)
}
