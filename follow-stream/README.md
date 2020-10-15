# follow-stream

This is a stream wrapper for [`follow`](https://www.npmjs.com/package/follow) and [`follow-registry`](https://www.npmjs.com/package/follow-stream).

## Usage

Pass in the options object for `follow` and get an object stream based on it.

```js
var followStream = require('follow-stream').follow({...});
```

Same for `follow-registry`.

```js
var followRegistryStream = require('follow-stream').followStream({...});
```

## License

MIT License. See LICENSE.txt.
