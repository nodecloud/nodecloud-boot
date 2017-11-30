'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setPath = setPath;
exports.getConfig = getConfig;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const env = process.env.NODE_ENV;

let configPath = __dirname;

function setPath(path) {
    configPath = path;
}

function getConfig(p, defaultValue) {
    const config = require(_path2.default.resolve(configPath, `bootstrap-${env}.js`));
    return _lodash2.default.get(config, p, defaultValue);
}