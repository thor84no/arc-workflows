let chalk = require('chalk')
let _longest = require('../_get-longest-subject')

module.exports = function logFactory(inventory) {
  let longest = _longest(inventory)
  return {
    title(appname) {
      console.log(chalk.cyan.bold(appname))
    },
    header(msg) {
      console.log('\n'+chalk.grey.bold(msg))
    },
    found(subject, arn) {
      var subj = `${subject} `.padEnd(longest, '.') + ' '
      console.log(chalk.dim(subj), chalk.green(arn))
    },
    notfound(msg) {
      var subj = `${msg} `.padEnd(longest, '.') + ' '
      console.log(chalk.dim(subj), chalk.yellow('ARN not found'))
    },
    error(msg) {
      console.log(chalk.red.bold('Error: '), chalk.white.bold(msg))
    }
  }
}
