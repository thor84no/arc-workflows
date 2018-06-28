let aws = require('aws-sdk')
let _logs = require('./_logs')

module.exports = function snstopics(inventory, callback) {
  let {header, notfound, found} = _logs(inventory)
  header(`SNS Topics`)
  let copy = inventory.snstopics.slice(0)
  let founds = []
  let sns = new aws.SNS
  function listTopics(next, done) {
    let params = next? {NextToken:next} : {}
    sns.listTopics(params, function _listTopics(err, result) {
      if (err) {
        notfound(err.message)
        done()
      }
      else {
        var index = 0
        result.Topics.map(t=> t.TopicArn.split(':').reverse().shift()).forEach(t=> {
          if (copy.includes(t)) {
            founds.push(t)
            found(t, result.Topics[index].TopicArn)
          }
          index += 1
        })
        if (result.NextToken) {
          listTopics(result.NextToken, done)
        }
        else {
          done()
        }
      }
    })
  }
  listTopics(false, function finished() {
    copy.forEach(t=> {
      if (!founds.includes(t)) {
        notfound(t)
      }
    })
    callback()
  })
}
