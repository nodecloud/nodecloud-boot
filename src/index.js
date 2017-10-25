import * as config from './config/config';

export default {
    getInstance(configPath) {
        config.setPath(configPath);
        return require('./NodeCloudBoot');
    }
}