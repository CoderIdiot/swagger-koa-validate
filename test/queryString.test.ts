import * as assert from "assert"
import { suite, test } from "mocha-typescript"

import request from './fixtureServer'

@suite("queryString check")
class PathTest {
    @test("valid param in query string")
    async testParamInQueryString() {
        let res = await request.get('/blog?page=2')
        assert.equal(res.statusCode, 200)
    }

    @test("invalid param in query string")
    async testInvalidParamInQueryString() {
        let res = await request.get('/blog?page=abc')
        assert.equal(res.statusCode, 400)
        assert.equal(res.body.message, 'Invalid format for parameter in query {page}, received: abc.  errors:data should be integer')
    }

}