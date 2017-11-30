module.exports = {
    dataSource: {
        database: 'test',
        host: '127.0.0.1',
        username: 'root',
        password: 'root',
        pool: {
            min: 10,
            max: 100,
            idle: 20000,
            acquire: 20000
        }
    }
};