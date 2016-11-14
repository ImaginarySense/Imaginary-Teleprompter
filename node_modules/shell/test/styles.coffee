
should = require 'should'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../lib/Shell'
styles = if process.env.SHELL_COV then require '../lib-cov/Styles' else require '../lib/Styles'

class Writer
  data: ''
  write: (data) -> @data += data

describe 'Styles', ->
  it 'Test colors # no style', ->
    writer = new Writer
    styles( {stdout: writer} )
    .println('Test default')
    writer.data.should.eql 'Test default\n'
  
  it 'Test colors # temporarily print bold then regular', ->
    writer = new Writer
    styles( {stdout: writer} )
    .print('Test ').bold('bo').bold('ld').print(' or ').regular('reg').regular('ular').print(' and ').bold('bold').ln()
    writer.data.should.eql '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[39m\u001b[1mbo\u001b[39m\u001b[22m\u001b[39m\u001b[1mld\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[39m\u001b[22mreg\u001b[39m\u001b[22mular\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[39m\u001b[1mbold\u001b[39m\u001b[22m\n'
  
  it 'Test colors # definitely pass to bold', ->
    writer = new Writer
    styles( {stdout: writer} )
    .print('Test ').bold().print('bo').print('ld').regular().print(' or ').print('reg').print('ular').print(' and ').bold().print('bo').print('ld').regular().ln()
    writer.data.should.eql '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[39m\u001b[1m\u001b[39m\u001b[1mbo\u001b[39m\u001b[1m\u001b[39m\u001b[1mld\u001b[39m\u001b[1m\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[39m\u001b[22mreg\u001b[39m\u001b[22m\u001b[39m\u001b[22mular\u001b[39m\u001b[22m\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[39m\u001b[1m\u001b[39m\u001b[1mbo\u001b[39m\u001b[1m\u001b[39m\u001b[1mld\u001b[39m\u001b[1m\u001b[39m\u001b[22m\n'
  
  it 'Test colors # temporary print green then blue', ->
    writer = new Writer
    styles( {stdout: writer} )
    .print('Test ').green('gre').green('en').print(' or ').blue('bl').blue('ue').print(' and ').green('green').ln()
    writer.data.should.eql '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[32m\u001b[22mgre\u001b[39m\u001b[22m\u001b[32m\u001b[22men\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[34m\u001b[22mbl\u001b[39m\u001b[22m\u001b[34m\u001b[22mue\u001b[39m\u001b[22m\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[32m\u001b[22mgreen\u001b[39m\u001b[22m\n'
  
  it 'Test colors # definitely pass to green', ->
    writer = new Writer
    styles( {stdout: writer} )
    .print('Test ').green().print('gre').print('en').nocolor(' or ').blue().print('bl').print('ue').nocolor(' and ').green().print('gre').print('en').ln()
    .reset()
    writer.data.should.eql '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22mgre\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22men\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[39m\u001b[22m or \u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[34m\u001b[22m\u001b[34m\u001b[22mbl\u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[34m\u001b[22mue\u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[39m\u001b[22m and \u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22mgre\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22men\u001b[32m\u001b[22m\u001b[32m\u001b[22m\n\u001b[39m\u001b[22m'

