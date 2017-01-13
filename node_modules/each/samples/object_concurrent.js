
var each = require('..');

each( {id_1: 1, id_2: 2, id_3: 3} )
.parallel( 2 )
.call(function(key, value, next) {
  console.log('key: ', key);
  console.log('value: ', value);
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
