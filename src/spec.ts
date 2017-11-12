import * as Trace from "debug-trace-fn"
const trace = Trace("trace")

import * as R from "ramda"
import * as pathToRegexp from "path-to-regexp"

import * as Ajv from "ajv"
const ajv = new Ajv({ coerceTypes: "array" })

ajv.addFormat("int32", value => Number.isInteger(+value))
ajv.addFormat("int64", value => Number.isInteger(+value))

export default (spec: object) => async (ctx, next) => {
  ctx.swagger = { paths: preCompile(spec["paths"]) }
  checkRequest(ctx)
  await next()
}

function checkRequest(ctx) {
  checkPath(ctx)
  checkMethod(ctx)
  checkRequired(ctx)

  checkParamsInPath(ctx)
  checkQueryString(ctx)
  checkHeader(ctx)

  // trace(ctx.swagger)

  ctx.status = 200
}

const preCompile = R.mapObjIndexed((value, key, obj) => {
  let keys = []
  let reg = pathToRegexp(R.replace("}", "", R.replace("{", ":", key)), keys)

  return R.merge(value, {
    urlReg: reg,
    urlKeys: R.map(value => value["name"], keys)
  })
})

const checkPath = ctx => {
  let pathBody = R.find(([path, pathBody]) => {
    let params = pathBody["urlReg"].exec(ctx.URL.pathname)
    if (!params) return false
    ctx.swagger.paramsInUrl = R.zipObj(pathBody["urlKeys"], R.tail(params))
    ctx.swagger.pathBody = pathBody
    return true
  }, R.toPairs(ctx.swagger.paths))

  if (!pathBody) throw { status: 404 }
}

const checkMethod = ctx => {
  let { method, swagger } = ctx
  method = R.toLower(method)

  if (!R.has(method, swagger.pathBody)) throw { status: 501 }
  swagger.methodBody = swagger.pathBody[method]
  swagger.methodBody.parameters = swagger.methodBody.parameters || {}
}

const checkRequired = ctx => {
  let path = R.find(([path, pathBody]) => {
    let params = pathBody["urlReg"].exec(ctx.URL.pathname)
    if (!params) return false
    return true
  }, R.toPairs(ctx.swagger.paths))

  let params = []
  R.forEach(value => {
    R.forEachObjIndexed((v, k) => {
      if (R.has("parameters", v))
        R.forEach(p => params.push(p), v["parameters"])
    }, value)
  }, path)

  R.forEach(value => {
      if (R.has("required", value))
          checkParamExist(ctx, value['in'], value['name'])    
  }, params)
}

const checkParamExist = (ctx, paramIn, paramName) => {
  trace(ctx.header, 'header')
  switch (paramIn) {
    case 'header': {
      if (R.has(paramName, ctx.header)) break;
      throw {
        status: 400,
        message:
            "Invalid Required Param " + paramName + " for parameter in " + paramIn
      }
    }
    case 'path': {
      break;
    }  
    default: {
      throw {
      status: 400,
      message:
          "Invalid Required Param " + paramName + "for parameter in " + paramIn
    }}  
  }
}

const checkParamsInPath = ctx =>
  checkParam(ctx, "path", ctx.swagger.paramsInUrl)

const checkQueryString = ctx => checkParam(ctx, "query", ctx.query)

const checkHeader = ctx => checkParam(ctx, "header", ctx.header)

const findParam = (ctx, paramIn, paramName) =>
  R.find(
    param => param["in"] == paramIn && param["name"] == paramName,
    ctx.swagger.methodBody.parameters
  )

const checkParam = (ctx, paramIn, parameters) => {
  return R.find(([paramName, value]) => {
    let paramSpec = findParam(ctx, paramIn, paramName)

    if (!paramSpec) return false

    if (!ajv.validate(paramSpec["schema"], value)) {
      throw {
        status: 400,
        message:
          "Invalid format for parameter in " +
          paramIn +
          " {" +
          paramName +
          "}, received: " +
          value +
          ".  errors:" +
          ajv.errorsText()
      }
    }
    return false
  }, R.toPairs(parameters))
}
