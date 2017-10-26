# NodeCloud-Boot

## Usage

```
npm install nodecloud-boot --save
```

Using with sequelize and mysql:

```javascript
import NCBoot from 'nodecloud-boot';
import Koa from 'koa';

const app = new Koa();

const configPath = __dirname;
const ncBoot = NCBoot.getInstance(configPath);

function startCallback(webConfig) {
    //do something before the web server start.
    
    return app.callback();
}

function endCallback() {
    //doing something before the process exit.
    
}

function initModels(sequelize) {
    //init sequelize models in this.
    
}

ncBoot.init({initModels})(startCallback, endCallback);

const consul = ncBoot.consul;
const sequelize = ncBoot.sequelize;
const client = ncBoot.client;
const loadbalance = ncBoot.loadbalance;
const logger = ncBoot.logger;
```

Using without sequelize:
```javascript
import NCBoot from 'nodecloud-boot';
import Koa from 'koa';

const app = new Koa();

const configPath = __dirname;
const ncBoot = NCBoot.getInstance(configPath);

function startCallback(webConfig) {
    //do something before the web server start.
    
    return app.callback();
}

function endCallback() {
    //doing something before the process exit.
    
}

ncBoot.initApp(startCallback, endCallback);

const consul = ncBoot.consul;
const sequelize = ncBoot.sequelize;
const client = ncBoot.client;
const loadbalance = ncBoot.loadbalance;
const logger = ncBoot.logger;
```

## Config file bootstrap-${env}.js
```javascript
import path from 'path';

module.exports = {
    web: {
        serviceId: null,
        serviceName: 'multi-cloud-schedule-service',
        port: 3006
    },
    consul: {
        host: '192.168.0.30',
        port: 8500,
        discoveryHost: null,
        timeout: '1s',
        interval: '10s'
    },
    config: {
        server: {
            name: 'multi-cloud-config-service',
            url: '/multi-cloud-config-service/v1/config/:service/:env/inner',
            interval: 60000,
            watch: false,
            client: 'multi-cloud-schedule-service'
        },
        local: {
            path: __dirname,
            service: 'config',
            ext: 'js'
        }
    },
    logger: {
        path: path.resolve(__dirname, '../log')
    }
};
```

## API

### NCBoot.getInstance(path): ncBoot

* path: The position of the config file bootstrap-${NODE_ENV}.js
* ncBoot: It will return the nodecloud-boot instance.

### ncBoot.initApp(startCallback, endCallback)

* startCallback: function(webConfig), A callback function before server started.
* endCallback: function() A callback function before server stopped.

### ncBoot.init(obj): {initApp(startCallback, endCallback)}

* obj: {initModels: function(sequelize)}
* initApp

### ncBoot.consul

The consul instance, you can use ncBoot.consul.client to get the original node-consul instance.

### ncBoot.sequelize

The sequelize instance.

### ncBoot.client

An http client with loadbalance and circuit.

### ncBoot.loadbalance

An http client with loadbalance.

### ncBoot.logger

The logger instance.