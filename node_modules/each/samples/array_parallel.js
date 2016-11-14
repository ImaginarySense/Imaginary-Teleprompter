
var each = require('..');

each( [{id: 1}, {id: 2}, {id: 3}] )
.parallel( true )
.call(function(element, index, next) {
  console.log('element: ', element, '@', index);
  setTimeout(next, 500);
})
.error(function(err){
  console.log(err.message);
  err.errors.forEach(function(error){
    console.log('  '+error.message);
  });
})
.then(function(){
  console.log('Done');
});
