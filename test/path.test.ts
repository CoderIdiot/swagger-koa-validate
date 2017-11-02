import * as assert from "assert"
import { suite, test } from "mocha-typescript"

import request from './fixtureServer'

@suite("path check")
class PathTest {
    @test("correct url")
    async testPaths() {
        let res = await request.get('/user')
        assert.equal(res.statusCode, 200)
    }

    @test("404")
    async test404() {
        let res = await request.get('/404')
        assert.equal(res.statusCode, 404)
    }

    @test("getUserById")
    async testGetUserById() {
        let res = await request.get('/user/100')
        assert.equal(res.statusCode, 200)
    }

    @test("getUserByWrongId")
    async testGetUserByWrongId() {
        let res = await request.get('/user/abc')
        assert.equal(res.statusCode, 400)
        assert.equal(res.body.message, 'Invalid format for parameter in path {id}, received: abc.  errors:data should be integer')
    }

    @test("wrong method")
    async testWrongMethod() {
        let res = await request.post('/user')
        assert.equal(res.statusCode, 501)
    }

    @test("path with queryString")
    async testPathWithQueryString() {
        let res = await request.post('/user/action/login')
        assert.equal(res.statusCode, 200)
    }

}