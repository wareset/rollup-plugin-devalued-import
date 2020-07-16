[npm]: https://img.shields.io/npm/v/rollup-plugin-devalued-import
[npm-url]: https://www.npmjs.com/package/rollup-plugin-devalued-import
[size]: https://packagephobia.now.sh/badge?p=rollup-plugin-devalued-import
[size-url]: https://packagephobia.now.sh/result?p=rollup-plugin-devalued-import

[![npm][npm]][npm-url]
[![size][size]][size-url]

# rollup-plugin-devalued-import

The plugin compiles the imported code separately and puts it in the bundle.
A [devalue](https://github.com/Rich-Harris/devalue) package is used for safe code compilation.

## Install

Using npm:

```console
npm install rollup-plugin-devalued-import --save-dev
```

or

```console
yarn add -D rollup-plugin-devalued-import
```

## Usage

```js
import devalued from 'rollup-plugin-devalued-import';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs',
  },
  plugins: [
    devalued({
      prefix: 'devalued!', // - by default
      strict: false // - by default.
      // If strict: true, there will be an import error
      // if the object doesn't work with the 'devalue' package
      rollup: {
        // any settings and plugins for the 'rollup':
        // plugins: [ e.g.: json(), svelte(), replace(), etc... ]
      }
    }),
  ],
};
```

# Example 1:

```js
// src/foo.js
const bar = [1, 2, 3, 4, 5];
const baz = bar.filter((v) => v % 2); // [1, 3, 5];
export { baz };
```

## !!!Configuration without a plugin:

```js
// src/main.js
import { baz } from './src/foo.js';
console.log(baz);
```

```js
// rollup.config.js
// ...

export default {
  input: 'src/main.js',
  output: {
    format: 'iife',
    file: 'public/bundle.js',
  },
  // ...
};
```

Result:

```js
// public/bundle.js
(function () {
  'use strict';
  const bar = [1, 2, 3, 4, 5];
  const baz = bar.filter((v) => v % 2); // [1, 3, 5];
  console.log(baz);
})();
```

## !!!Configuration with a plugin:

```js
// src/main.js
import { baz } from 'devalued!./src/foo.js';
console.log(baz);
```

```js
// rollup.config.js
import devalued from 'rollup-plugin-devalued-import';
// ...

export default {
  input: 'src/main.js',
  output: {
    format: 'iife',
    file: 'public/bundle.js',
  },
  plugins: [devalued()],
  // ...
};
```

Result:

```js
// public/bundle.js
(function () {
  'use strict';
  const baz = [1, 3, 5];
  console.log(baz);
})();
```

# Example 2:

```js
// src/foo.js
import BIG_JSON_FILE from 'somepath/big_file.json';
// { q1: 1, q2: 2 , q3: 3, q4: 4, q5: 5, ... }

const many_keys = Object.keys(BIG_JSON_FILE); // ['q1', 'q2', 'q3', ...]
export default many_keys;
```

## !!!Configuration without a plugin:

```js
// src/main.js
import many_keys from './src/foo.js';
console.log(many_keys);
```

```js
// rollup.config.js
import json from '@rollup/plugin-json';
// ...

export default {
  input: 'src/main.js',
  output: {
    format: 'iife',
    file: 'public/bundle.js',
  },
  plugins: [json()],
  // ...
};
```

Result:

```js
// public/bundle.js
(function () {
  'use strict';
  const BIG_JSON_FILE = { q1: 1, q2: 2, q3: 3 /* ... */ };
  const many_keys = Object.keys(BIG_JSON_FILE);
  console.log(many_keys);
})();
```

## !!!Configuration with a plugin:

```js
// src/main.js
import many_keys from 'devalued!./src/foo.js';
console.log(many_keys);
```

```js
// rollup.config.js
import json from '@rollup/plugin-json';
import devalued from 'rollup-plugin-devalued-import';
// ...

export default {
  input: 'src/main.js',
  output: {
    format: 'iife',
    file: 'public/bundle.js',
  },
  plugins: [
    devalued({
      rollup: {
        plugins: [json() /* and other plugins */],
      },
    }),
  ],
  // ...
};
```

Result:

```js
// public/bundle.js
(function () {
  'use strict';
  const many_keys = ['q1', 'q2', 'q3' /* ... */];
  console.log(many_keys);
})();
```

## Meta

[LICENSE (MIT)](/LICENSE)
