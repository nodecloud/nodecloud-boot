import * as config from './config/config';

export function getInstance(configPath) {
    config.configs.path = configPath;
    return require('./NodeCloudBoot');
}