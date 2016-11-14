
utils = require '../utils'

querystring =
  unescape: (str) ->
    decodeURIComponent str
  parse: (qs, sep, eq) ->
    sep = sep or '&'
    eq = eq or '='
    obj = {}
    return obj if typeof qs isnt 'string'
    vkps = qs.split sep
    for kvp in vkps
      x = kvp.split eq
      k = querystring.unescape x[0], true
      v = querystring.unescape x.slice(1).join(eq), true
      if not k in obj
        obj[k] = v
      else if not Array.isArray obj[k]
        obj[k] = [obj[k], v]
      else
        obj[k].push v
    obj

# produce regular expression from string
normalize = (command, keys, sensitive) ->
  command = command
  .concat('/?')
  .replace(/\/\(/g, '(?:/')
  # regexp factors:
  #  0. match a literal ':'
  #  1. 'key': match 1 or more word characters followed by :
  #  2. 'format': match anything inside (), should be a regexp factor ie ([0-9]+)
  #  3. 'optional': match an optional literal '?'
  .replace(/:(\w+)(\(.*\))?(\?)?/g, (_, key, format, optional) ->
    keys.push key
    format = format or '([^ ]+)' # provide default format
    optional = optional or ''
    return format + optional
  )
  .replace(/([\/.])/g, '\\$1')
  .replace(/\*/g, '(.+)')
  new RegExp '^' + command + '$', ( 'i' if sensitive? )

match = (req, routes, i) ->
  #from ?= 0
  #to = routes.length - 1
  #for (len = routes.length; i < len; ++i) {
  #for i in [from .. to]
  i ?= 0
  while i < routes.length
    route = routes[i]
    #fn = route.callback
    regexp = route.regexp
    keys = route.keys
    captures = regexp.exec req.command
    if captures
      route.params = {}
      index = 0
      #for (j = 1, len = captures.length; j < len; ++j) {
      #for j in [1 .. captures.length]
      j = 1
      while j < captures.length
        key = keys[j-1]
        val =
          if typeof captures[j] is 'string'
          then querystring.unescape captures[j]
          else captures[j]
        if key
          route.params[key] = val
        else
          route.params[''+index] = val
          index++
        j++
      req._route_index = i
      return route
    i++
  null

module.exports = (settings) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  settings.sensitive ?= true
  # Expose routes
  routes = shell.routes = []
  params = {}
  shell.param = (name, fn) ->
    if Array.isArray name
      name.forEach (name) ->
        this.param name, fn
      , this
    else
      name = name.substr(1) if ':' is name[0]
      params[name] = fn
    this
  shell.cmd = (command, description, middleware1, middleware2, fn) ->
    args = Array.prototype.slice.call arguments
    route = {}
    route.command = args.shift()
    route.description = args.shift() if typeof args[0] is 'string'
    route.middlewares = utils.flatten args
    keys = []
    route.regexp = 
      if   route.command instanceof RegExp
      then route.command
      else normalize route.command, keys, settings.sensitive
    route.keys = keys
    routes.push route
    this
  # Register 'quit' command
  shell.cmd 'quit', 'Exit this shell', shell.quit.bind shell
  # middleware
  (req, res, next) ->
    route = null
    self = this
    i = 0
    pass = (i) ->
      route = match req, routes, i
      return next() if not route
      i = 0
      keys = route.keys
      req.params = route.params
      # Param preconditions
      # From expresso guide: There are times when we may want to "skip" passed 
      # remaining route middleware, but continue matching subsequent routes. To 
      # do this we invoke `next()` with the string "route" `next('route')`. If no 
      # remaining routes match the request url then Express will respond with 404 Not Found.
      param = (err) ->
        try
          key = keys[ i++ ]
          val = req.params[ key ]
          fn = params[ key ]
          if 'route' is err
            pass req._route_index + 1
          # Error
          else if err
            next err
          # Param has callback
          else if fn
            # Return style
            if 1 is fn.length
              req.params[key] = fn val
              param()
            # Middleware style
            else
              fn req, res, param, val
          # Finished processing params
          else if not key
            # route middleware
            i = 0
            nextMiddleware = (err) ->
              fn = route.middlewares[ i++ ]
              if 'route' is err
                pass req._route_index + 1
              else if err
                next err
              else if fn
                fn req, res, nextMiddleware
              else
                pass req._route_index + 1
                #route.callback.call self, req, res, (err) ->
                  #if err
                    #next err
                  #else
                    #pass req._route_index + 1
            nextMiddleware()
          # More params
          else
            param()
        catch err
          next err
      param()
    pass()
