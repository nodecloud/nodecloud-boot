import * as config from './config/config';

export default {
    getInstance(configPath) {
        config.configs.path = configPath;
        return require('./NodeCloudBoot');
    }
}