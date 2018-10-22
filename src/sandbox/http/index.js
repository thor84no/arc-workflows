// 3rd party
var Router = require('router')
var body = require('body-parser')
var finalhandler = require('finalhandler')

// built ins
var http = require('http')
//var read = require('fs').readFileSync
//var join = require('path').join

// local modules
let readArc = require('../../util/read-arc')
var reg = require('./_register-route')
var regHTTP = require('./_register-http-route')
const regQueues = require('./_register-queues')
var static = require('./_static')

// config arcana
var app = Router()
app.use(body.json())
app.use(body.urlencoded({extended: false}))
app.use(static)

// keep a reference up here for fns below
let server

// starts the http server
app.start = function start(callback) {

  // read the arc file
  var web = readArc().arc
  var tuple = v=> (['get', v])

  // build the routes
  if (web.queues)
    regQueues(app, '@queues', 'queue', web.queues)

  if (web.http)
    regHTTP(app, '@http', 'http', web.http)

  if (web.html)
    reg(app, '@html', 'html', web.html)

  if (web.json)
    reg(app, '@json', 'json', web.json)

  if (web.xml)
    reg(app, '@xml', 'xml', web.xml)

  if (web.js)
    reg(app, '@js', 'js', web.js.map(tuple))

  if (web.css)
    reg(app, '@css', 'css', web.css.map(tuple))

  if (web.text)
    reg(app, '@text', 'text', web.text.map(tuple))

  // create an actual server; how quaint!
  server = http.createServer(function _request(req, res) {
    app(req, res, finalhandler(req, res))
  })

  server.listen(process.env.PORT, callback)
  return app
}

app.close = function close() {
  server.close()
}

// export the app
module.exports = app
