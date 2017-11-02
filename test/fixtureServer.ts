import * as assert from "assert"
import { suite, test } from "mocha-typescript"

import * as Trace from 'debug-trace-fn'
const trace = Trace('trace')

import * as fs from "fs-extra"
const YAML = require('yamljs')

import ValidatorFactory from '../src/spec'

const specString = fs.readFileSync(__dirname + '/../../test/api.yaml', 'utf-8')
const spec = YAML.parse(specString)
const validate = ValidatorFactory(spec)

import * as Koa from "koa"
const app = new Koa()

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
const request = require("supertest")(app.listen(3000))

export default request