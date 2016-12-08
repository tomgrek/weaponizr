# Weaponizr

A front-end framework that does just what needs to be done.

## Yet another front-end framework?

Yeah! I was playing around to explore Javascript's 'Proxy' class, which seemed
quite framework-y to me. So I learned it by building a framework.

It's designed to be minimal, unopinionated, and a relaxing antidote to complicated frameworks.

## Building

Use the JS file as is. Minifying actually *increases* the size of the source code, becuase
the Uglify minifier doesn't support ES6, so you have to transpile to ES5 first. It's
also strange to do this because the library needs the ES6 Proxy feature.

## License?

MIT licensed.
