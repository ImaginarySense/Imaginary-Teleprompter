
var each = require('..');

each( [{id: 1}, {id: 2}, {id: 3}] )
.call(function(element, index, next) {
  console.log('element: ', element, '@', index);
  setTimeout(next, 500);
})
.error(function(err) {
  console.log(err.message);
})
.then(function() {
  console.log('Done');
});
