import _ from 'lodash';
import path from 'path';

const env = process.env.NODE_ENV;

export const configs = {
    configPath: __dirname
};

export function getConfig(p, defaultValue) {
    const config = require(path.resolve(configs.configPath, `bootstrap-${env}.js`));
    return _.get(config, p, defaultValue);
}