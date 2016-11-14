[![Build Status](https://secure.travis-ci.org/wdavidw/node-each.png)](http://travis-ci.org/wdavidw/node-each)

<pre style="font-family:courier">
 _   _           _        ______           _     
| \ | |         | |      |  ____|         | |    
|  \| | ___   __| | ___  | |__   __ _  ___| |__  
| . ` |/ _ \ / _` |/ _ \ |  __| / _` |/ __| '_ \ 
| |\  | (_) | (_| |  __/ | |___| (_| | (__| | | |
|_| \_|\___/ \__,_|\___| |______\__,_|\___|_| |_| New BSD License
</pre>


[Full documentation for the Each is available here](http://www.adaltas.com/projects/node-each/).

Note, for user of versions 0.2.x and below, arguments of the item callback have changed. See [the documentation](http://www.adaltas.com/projects/node-each/) for additionnal information.

Node Each is a single elegant function to iterate asynchronously over elements 
both in `sequential`, `parallel` and `concurrent` mode.

## Example

```javascript
each( [{id: 1}, {id: 2}, {id: 3}] )
.call( function(element, index, next){
  console.log('element: ', element, '@', index);
  setTimeout(next, 500);
})
.then( function(err){
  console.log(err ? err.message : 'Done');
});
```

## Development

Node Each comes with a few example, all present in the "samples" folder. Here's how you may run each of them :

```bash
node samples/array_concurrent.js
node samples/array_parallel.js
node samples/array_sequential.js
node samples/object_concurrent.js
node samples/object_sequential.js
node samples/readable_stream.js
```

Tests are executed with mocha. To install it, simple run `npm install`, it will install
mocha and its dependencies in your project "node_modules" directory.

```bash
make test
```
