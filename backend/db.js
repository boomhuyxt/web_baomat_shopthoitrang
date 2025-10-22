const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'yourstyle',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test connection
promisePool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối thành công đến cơ sở dữ liệu MySQL!');
        connection.release();
    })
    .catch(error => {
        console.error('LỖI KẾT NỐI DATABASE:', error);
    });

// Handle errors
pool.on('error', (err) => {
    console.error('Lỗi pool database:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Mất kết nối database. Vui lòng kiểm tra kết nối.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database có quá nhiều kết nối.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Yêu cầu kết nối database bị từ chối.');
    }
});

module.exports = pool;