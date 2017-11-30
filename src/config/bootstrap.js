import _ from 'lodash';
import path from 'path';

const env = process.env.NODE_ENV;

let configPath = __dirname;

export function setPath(path) {
    configPath = path;
}

export function getConfig(p, defaultValue) {
    const config = require(path.resolve(configPath, `bootstrap-${env}.js`));
    return _.get(config, p, defaultValue);
}