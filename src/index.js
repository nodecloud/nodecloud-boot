import * as bootstrap from './config/bootstrap';
import tracing from './tracing';

export default {
    getInstance(configPath) {
        bootstrap.setPath(configPath);
        if (bootstrap.getConfig('tracing', false)) {
            tracing()
        }
        return require('./NodeCloudBoot');
    }
}