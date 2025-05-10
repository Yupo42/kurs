// worker
// 4lY_.N)@cnPFO9/T 

// admin
// HZiyc)fz8AuQLaqj

const mysql = require('mysql2');

// Функция для создания подключения
const createConnection = (user, password) => {
    return mysql.createPool({
        host: 'localhost',
        user: user,
        password: password,
        database: 'furnitureBD'
    }).promise();
};

// Предопределенные подключения для ролей
const connections = {
    guest: createConnection('guest', ''),
    worker: createConnection('worker', '4lY_.N)@cnPFO9/T'),
    admin: createConnection('admin', 'HZiyc)fz8AuQLaqj')
};

module.exports = connections;