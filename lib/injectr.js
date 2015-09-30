"use strict";

var cache = {},
    fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    encoding = 'utf8',
    OPTION_FILE_NAME = '.injectrrc',
    injectrRC,
    options = { babel: null, babelOptions: null };

/**
 * Parse options from .injectrrc if present.
 * Injectrrc is expected to be a JSON file.
 */
(function _parseOptions() {
  try {
      injectrRC = fs.readFileSync(
        process.env.PWD + '/' + OPTION_FILE_NAME,
        encoding
      );

      try {
          options = JSON.parse(injectrRC);
      } catch (e) {
          console.error('ERR: Unable to parse .injectrrc file');
      }
  } catch (e) {}
})();

module.exports = function (file, mocks, context) {
    var script;
    mocks = mocks || {};
    context = context || {};
    file = path.join(path.dirname(module.parent.filename), file);
    cache[file] = cache[file] || module.exports.onload(file,
        fs.readFileSync(file, encoding));
    script = vm.createScript(cache[file], file);
    context.require = function (a) {
        if (mocks[a]) {
            return mocks[a];
        }
        if (a.indexOf('.') === 0) {
            a = path.join(path.dirname(file), a);
        }
        return require(a);
    };
    context.module = context.module || {};
    context.module.exports = {};
    context.exports = context.module.exports;

    script.runInNewContext(context);
    return context.module.exports;
};

module.exports.onload = function (file, content) {
    if (file.match(/\.coffee$/)) {
        return require('coffee-script').compile(content, {
            filename : file
        });
    } else if (options.babel && file.match(/\.js(x)?$/)) {
        return require('babel-core').transform(
          content,
          options.babelOptions || {}
        ).code;
    }
    return content;
};
