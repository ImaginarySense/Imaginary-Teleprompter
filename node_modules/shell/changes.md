
List of API changes and enhancements
====================================

Version 0.2.10
--------------

Move coffee as a dev dependency

Version 0.2.9
-------------

Make it a better citizen
Generate JS code
Rename `attach` option to `detached` in start_stop
Restart on file change in start_stop

Version 0.2.8
-------------

Broader Node.js requirement to 0.6

Version 0.2.7
-------------

Fix Win7 completion (by [t101jv](https://github.com/t101jv))
Fix compatibility with Node.js version 0.8

Version 0.2.6
-------------

Reflect latest CoffeeScript strict mode

Version 0.2.5
-------------

Add cmd and path options to http plugin
Stylus plugin
StartStop script improvement

Version 0.2.4
-------------

`Shell.question` has been removed, use `req.question` instead
`Shell.confirm` has been removed, use `req.confirm` instead
Add `styles.unstyle`
`detach` option changed in favor of `attach` in `start_stop`
`start_stop` processes are now run as daemon by default

Version 0.2.3
-------------

Parameters routes contrains
Add chdir setting
Workspace discovery start from script root instead of cwd

version 0.2.2
-------------

Plugin Cloud9, HTTP and Redis must be defined before the route plugin
