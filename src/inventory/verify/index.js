let _apigateway = require('./_apigateway')
let series = require('run-series')
let _iam = require('./_iam')
let _lambda = require('./_lambda')
let {header, title} = require('./_logs')
let _dynamodb = require('./_dynamodb')
let _s3 = require('./_s3')
let _sns = require('./_sns')

module.exports = function _cloud(inventory) {

  // draw some header output
  header('Inventory Verify')
  title(inventory.app)

  // walk thru the inventory
  let apigateway = _apigateway.bind({}, inventory)
  let iam = _iam.bind({}, inventory)
  let lambda = _lambda.bind({}, inventory)
  let dynamodb = _dynamodb.bind({}, inventory)
  let s3 = _s3.bind({}, inventory)
  let sns = _sns.bind({}, inventory)

  series([
    apigateway,
    iam,
    lambda,
    s3,
    dynamodb,
    sns,
  ])
}
