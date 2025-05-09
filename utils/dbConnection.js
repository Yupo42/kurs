// 4lY_.N)@cnPFO9/T 


const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'furnitureBD'
});
module.exports = dbConnection.promise();