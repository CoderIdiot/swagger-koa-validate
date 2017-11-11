import * as assert from "assert"
import { suite, test } from "mocha-typescript"

import request from './fixtureServer'

@suite("header check")
class HeaderTest {
    @test("valid header")
    async testHeader() {
        let res = await request.get('/user').
            set({
                "id": 100
            })
        assert.equal(res.statusCode, 200)
    }

    @test("invalid header")
    async testInvalidHeader() {
        let res = await request.get('/user').
            set({
                "id": "string"
            })
        assert.equal(res.statusCode, 400)
        assert.equal(res.body.message, 'Invalid format for parameter in header {id}, received: string.  errors:data should be integer')
    }

    @test("void header")
    async testVoidHeader() {
        let res = await request.get('/user')
        assert.equal(res.statusCode, 400)
    }

}