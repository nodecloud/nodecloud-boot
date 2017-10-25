'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configs = undefined;
exports.getConfig = getConfig;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const env = process.env.NODE_ENV;

const configs = exports.configs = {
    configPath: __dirname
};

function getConfig(p, defaultValue) {
    const config = require(_path2.default.resolve(configs.configPath, `bootstrap-${env}.js`));
    return _lodash2.default.get(config, p, defaultValue);
}