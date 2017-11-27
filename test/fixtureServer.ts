import * as assert from "assert"
import { suite, test } from "mocha-typescript"

import * as Trace from 'debug-trace-fn'
const trace = Trace('trace')

const $RefParser = require('json-schema-ref-parser')
var parser = new $RefParser()


import * as Koa from "koa"
const app = new Koa()

import ValidatorFactory from '../src/spec'
parser.dereference(__dirname + '/../../test/api.yaml')
    .then(function (spec) {
        let validate = ValidatorFactory(spec)
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

const request = require("supertest")(app.listen(3000))

export default request