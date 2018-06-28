let _logs = require('./_logs')
let series = require('run-series')
let aws = require('aws-sdk')

module.exports = function checkIAM(inventory, callback) {
  let {header, found, error, notfound} = _logs(inventory)
  header('IAM Roles')
  let iam = new aws.IAM
  series(inventory.iamroles.map(RoleName=> {
    return function _getRole(callback) {
      iam.getRole({RoleName}, function _prettyPrint(err, result) {
        if (err && err.code === 'NoSuchEntity') {
          notfound(RoleName)
        }
        else if (err) {
          error(err.message)
        }
        else {
          found(RoleName, result.Role.Arn)
        }
        callback()
      })
    }
  }), callback)
}
