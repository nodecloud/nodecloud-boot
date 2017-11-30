import * as bootstrap from './config/bootstrap';

export default {
    getInstance(configPath) {
        bootstrap.setPath(configPath);
        return require('./NodeCloudBoot');
    }
}