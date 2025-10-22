const db = require('./db');

db.query('SELECT ID_Products, image_url, id_Categories, price FROM Products LIMIT 10', (err, results) => {
    if (err) {
        console.error('Query error:', err);
        process.exit(1);
    }
    console.log('Sample products:');
    results.forEach(r => console.log(r));
    process.exit(0);
});
