# swagger-koa-validate
a koa middleware for swagger spec validate

## TODO
- required param
- Swagger2Schema（validate once）
- method name & header property name toLowercase

## Useage
```typescript
import * as Koa from "koa"
const app = new Koa()

const specString = fs.readFileSync(__dirname + '/../../test/api.yaml', 'utf-8')
const spec = YAML.parse(specString)
var validate

parser.dereference(__dirname + '/../../test/api.yaml')
    .then(function (spec) {
        validate = ValidatorFactory(spec)
        app.use(async (ctx, next) => {
            try {
                await next()
            } catch (error) {
                ctx.status = error.status || 400
                ctx.body = { message: error.message }
                trace(error)
            }
        })
        app.use(validate)
    })
    .catch(console.log)

```