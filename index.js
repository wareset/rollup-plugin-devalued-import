const ROLLUP = require('rollup');
// const vm = require('vm');
const requireFromString = require('require-from-string');
const devalue = require('devalue');

function devalued({ prefix = 'devalued!', strict = false, rollup = {} } = {}) {
  const SAFES = {};
  const CACHE = [];

  function compile(input) {
    return Promise.resolve(ROLLUP.rollup({ ...rollup, input }))
      .then((bundle) => {
        return bundle.generate({
          format: 'cjs',
          name: input,
          exports: 'named',
        });
      })
      .then((outputs) => {
        const output = outputs.output[0];

        // console.log(output);

        // const context = { exports: {} };
        // vm.createContext(context);
        // vm.runInContext(output.code, context);

        const context = { exports: requireFromString(output.code, input) };

        let code = '';
        const _temp = new Map();
        const keys = Object.keys(context.exports);

        let __default__ = '__default__';
        const loop = () => {
          keys.some((v) => v === __default__) && (__default__ += '1') && loop();
        };
        loop();

        keys.forEach((_key) => {
          let key = _key;
          let value = context.exports[key];
          if (key === 'default') key = __default__;

          let success = true;
          if (!_temp.has(value)) {
            _temp.set(value, key);
            try {
              value = devalue(value);
            } catch (err) {
              if (!strict) success = false;
              else throw new Error(err);
            }
          } else value = _temp.get(value);

          if (success) code += `\nexport const ${key} = ${value};`;
          else {
            code += `\nimport { ${_key} as ${key} } from '${input}';`;
            code += `\nexport { ${key} }`;
          }

          if (key === __default__) code += `\nexport default ${__default__};`;
        });

        console.log(code);

        return code;
      });
  }

  return {
    name: 'devalued-import',

    resolveId(source, importer) {
      if (source.indexOf(prefix) === 0) {
        source = source.slice(prefix.length);
        const ID = source + '|' + importer;
        SAFES[ID] = [source, importer];
        return ID;
      }

      return null;
    },

    load(ID) {
      if (ID in SAFES) {
        return Promise.resolve(this.resolve(...SAFES[ID])).then(({ id }) => {
          this.addWatchFile(id);
          return CACHE[id] || (CACHE[id] = compile(id));
        });
      }

      return null;
    },

    watchChange(id) {
      if (id in CACHE) delete CACHE[id];
    },
  };
}

module.exports = devalued;
