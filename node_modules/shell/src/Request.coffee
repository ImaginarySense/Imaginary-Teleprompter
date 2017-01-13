
each = require 'each'

module.exports = class Request
  constructor: (shell, command) ->
    @shell = shell
    @command = command
  ###
  Ask one or more questions
  ###
  question: (questions, callback) ->
    isObject = (v) -> typeof v is 'object' and v? and not Array.isArray v
    multiple = true
    answers = {}
    if isObject questions
      questions = for q, v of questions 
        v ?= {}
        v = { value: v } unless isObject v
        v.name = q
        v
    else if typeof questions is 'string'
      multiple = false
      questions = [{name: questions, value: ''}]
    each(questions)
    .on 'item', (question, next) =>
      q = "#{question.name} "
      q += "[#{question.value}] " if question.value
      @shell.interface().question q, (answer) ->
        answer = answer.substr(0, answer.length - 1) if answer.substr(-1, 1) is '\n'
        answers[question.name] = 
          if answer is '' then question.value else answer
        next()
    .on 'end', ->
      answers = answers[questions[0].name] unless multiple
      return callback answers
  ###
  Ask a question expecting a boolean answer
  ###
  confirm: (msg, defaultTrue, callback) ->
    args = arguments
    unless callback
      callback = defaultTrue
      defaultTrue = true
    @shell.settings.key_true ?= 'y'
    @shell.settings.key_false ?= 'n'
    key_true = @shell.settings.key_true.toLowerCase() 
    key_false = @shell.settings.key_false.toLowerCase() 
    keyTrue  = if defaultTrue then key_true.toUpperCase()  else key_true
    keyFalse = if defaultTrue then key_false else key_false.toUpperCase()
    msg += ' '
    msg += "[#{keyTrue}#{keyFalse}] "
    question = @shell.styles.raw( msg, {color: 'green'})
    @shell.interface().question question, (answer) =>
      accepted = ['', key_true, key_false]
      answer = answer.substr(0, answer.length - 1) if answer.substr(-1, 1) is '\n'
      answer = answer.toLowerCase()
      valid = accepted.indexOf(answer) isnt -1
      return @confirm.apply(@, args) unless valid
      callback answer is key_true or (defaultTrue and answer is '')
