
colors =
  black: 30
  red: 31
  green: 32
  yellow: 33
  blue: 34
  magenta: 35
  cyan: 36
  white: 37

bgcolors =
  black: 40
  red: 41
  green: 42
  yellow: 43
  blue: 44
  magenta: 45
  cyan: 46
  white: 47

module.exports = Styles = (settings = {}) ->
  if @ not instanceof Styles
    return new Styles settings
  @settings = settings
  @settings.stdout = settings.stdout ? process.stdout
  # Current state
  @current =
    weight: 'regular'
  # Export colors
  @colors = colors
  @bgcolors = bgcolors
  @

# Color
Styles.prototype.color = (color, text) ->
  @print text, {color: color}
  # Save state if no text
  @current.color = color unless text
  @

for color, code of colors
  do (color) ->
    Styles.prototype[color] = (text) ->
      @color color, text

Styles.prototype.nocolor = (text) ->
  @color null, text

# bgcolor
Styles.prototype.bgcolor = (bgcolor) ->
  bgcolor ?= 0
  @print '\x1B[' + bgcolor + ';m39'
  @

# Font weight
Styles.prototype.weight = (weight, text) ->
  @print text, {weight: weight}
  if not text
    # Save state if no text
    @current.weight = weight
  @

Styles.prototype.bold = (text) ->
  @weight 'bold', text

Styles.prototype.regular = (text) ->
  @weight 'regular', text

# Print

Styles.prototype.print = (text, settings) ->
  @settings.stdout.write @raw(text, settings)
  @

Styles.prototype.println = (text) ->
  @settings.stdout.write text + '\n'
  @

Styles.prototype.ln = ->
  @settings.stdout.write '\n'
  @

# Others

Styles.prototype.raw = (text, settings) ->
  raw = '';
  settings ?= {}
  if settings.color isnt null and ( settings.color or @current.color )
    raw += '\x1b[' + @colors[settings.color or @current.color] + 'm'
  else
    raw += '\x1b[39m'
  switch settings.weight or @current.weight
    when 'bold'
      raw += '\x1b[1m'
    when 'regular'
      raw += '\x1b[22m'
    else
      throw new Error 'Invalid weight "' + weight + '" (expect "bold" or "regular")'
  if text
    # Print text if any
    raw += text
    # Restore state if any
    if @current.color and @current.color isnt settings.color
      raw += @raw null, @current.color
    if @current.weight and @current.weight isnt settings.weight
      raw += @raw null, @current.weight
  raw

Styles.prototype.reset = (text) ->
  @print null,
    color: null
    weight: 'regular'

# Remove style
Styles.unstyle = (text) -> text.replace(/\x1b.*?m/g, '')

