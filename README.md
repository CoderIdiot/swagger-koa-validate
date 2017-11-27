# swagger-koa-validate
a koa middleware for swagger spec validate

## Useage

    demo: https://github.com/CoderIdiot/swagger-koa-validation-demo
    use with the koa:

```javascript

import Koa from "koa"
import ValidatorFactory from "swagger-koa-validate"
const $RefParser = require("json-schema-ref-parser")
/*
 * Read the API, and init the validate
 */

const app = new Koa()
let parser = new $RefParser()

parser.dereference(__dirname + "/../api/api.yml", "utf-8").then(
  spec => {
    let validate = ValidatorFactory(spec)
    app.use(async (ctx, next) => {
      try {
        await next()
      } catch (error) {
        ctx.status = error.status || 400
        ctx.body = { message: error.message }
        console.log("Error", error.status, error.message)
      }
    })
    app.use(validate)
    app.use(ctx => {
      ctx.body = "hello world"
    })
  },
  err => console.log(err)
)

app.listen(3000)

```