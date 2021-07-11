const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const router = require('./router')
const cors = require('@koa/cors')
const staticResource = require('koa-static')
const path = require('path')

const PORT = 10001

const app = new Koa()

app.use(cors())
app.use(bodyParser())
app.use(staticResource(path.join(__dirname, 'public')))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(PORT)
console.log(`app run in port: ${PORT}`)
console.log(`visit http://localhost:${PORT}/index.html to start demo`)
