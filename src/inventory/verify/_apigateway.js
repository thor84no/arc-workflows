let aws = require('aws-sdk')
let _logs = require('./_logs')

module.exports = function restapis(inventory, callback) {
  let {header, found, error, notfound} = _logs(inventory)
  header('API Gateway RestAPIs')
  let api = new aws.APIGateway
  api.getRestApis({
    limit: 500 // FIXME this needs pagination; tho most api gateways are limited to 60 by default so no rush..
  },
  function _getRestApis(err, result) {
    if (err) {
      error(err.message)
      callback()
    }
    else {
      var name = `${inventory.app}-staging`
      var staging = result.items.find(o=> o.name === name)
      if (staging) {
        found(staging.name, staging.id)
      }
      else {
        notfound(name)
      }
      var name = `${inventory.app}-production`
      var production = result.items.find(o=> o.name === name)
      if (production) {
        found(production.name, production.id)
      }
      else {
        notfound(name)
      }
    }
    callback()
  })
}
