

const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./my-database.db');

db.all('SELECT * FROM Product WHERE ProductName = "Metadefender Vault" AND VendorId = "1" ', function(err: Error, rows: any) {
    console.log(rows);
});
