"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const axios_1 = __importDefault(require("axios"));
const Functions_1 = require("./Functions");
const Functions_2 = require("./Functions");
const Data = require('./Data.json');
let idversion = 0;
let firstiteration = true;
const sqlite3 = require('sqlite3').verbose();
class Database {
    constructor() {
        //delete old file 
        // if(fs.existsSync('./my-database.db')){
        //     fs.unlinkSync('./my-database.db');  
        // }
        this.db = new sqlite3.Database('./my-database.db');
        console.log(Data);
        this.HandleData();
    }
    HandleData() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const vendor of Data.Vendors) {
                yield this.createTable('Vendor', ['VendorId INTEGER PRIMARY KEY AUTOINCREMENT', 'VendorName TEXT', 'contactInfo TEXT', 'WebsiteUrl TEXT']);
                yield this.insertData('Vendor', ['VendorName', 'contactInfo', 'WebsiteUrl'], [vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);
                for (const product of vendor.Products) {
                    firstiteration = true;
                    yield this.createTable('Product', ['ProductId INTEGER PRIMARY KEY AUTOINCREMENT', 'ProductName TEXT', 'VendorId INTEGER', 'JSON_URL TEXT']);
                    yield this.insertData('Product', ['ProductName', 'VendorId', 'JSON_URL'], [product.ProductName, vendor.VendorId.toString(), product.JSON_URL]);
                    let listofVersions = yield axios_1.default.get(product.JSON_URL);
                    console.log(listofVersions);
                    listofVersions = listofVersions.data.plugins;
                    console.log('listofVersions', listofVersions);
                    //itertate over array
                    for (const version of listofVersions) {
                        if (version.data.contents !== undefined) {
                            listofVersions = version.data.contents;
                            console.log('listofVersions', listofVersions);
                        }
                    }
                    for (const version of listofVersions) {
                        //skip first iteration
                        if (firstiteration) {
                            firstiteration = false;
                            continue;
                        }
                        let ReleaseDate_DateTime = (0, Functions_2.parseDate)(version[1]);
                        let EndOfSupportDate_DateTime = (0, Functions_2.parseDate)(version[2]);
                        console.log('ReleaseDate_DateTime', ReleaseDate_DateTime);
                        console.log('EndOfSupportDate_DateTime', EndOfSupportDate_DateTime);
                        //define ProductId as the foreign key from Product table
                        yield this.createTable('Version');
                        yield this.insertData('Version', ['VersionName', 'ProductId', 'ReleaseDate', 'EndOfSupportDate', 'ProductName', 'VendorName'], [
                            version[0],
                            product.ProductId,
                            ReleaseDate_DateTime ? ReleaseDate_DateTime.toISOString() : 'NULL',
                            EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime.toISOString() : 'NULL',
                            product.ProductName,
                            vendor.VendorName
                        ]);
                        // Only calculate daysUntilEOS and notify if EndOfSupportDate exists
                        // if (EndOfSupportDate_DateTime) {
                        //     const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        //     this.UpdateData('Version', ['EndOfSupportDate'], [EndOfSupportDate_DateTime.toISOString()]);
                        //     // await notify_on_end_of_support(version, daysUntilEOS);
                        // }
                    }
                }
            }
            idversion = 0;
            return true;
        });
    }
    createTable(table, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let sql;
                    if (table === 'Version') {
                        sql = `CREATE TABLE IF NOT EXISTS Version (
                        VersionId INTEGER PRIMARY KEY AUTOINCREMENT,
                        VersionName TEXT,
                        ProductId INTEGER,
                        ReleaseDate DATE,
                        EndOfSupportDate DATE,
                        ProductName TEXT,
                        VendorName TEXT,
                        FOREIGN KEY (ProductId) REFERENCES Product(ProductId)
                    )`;
                    }
                    else {
                        const columnsString = columns.join(',');
                        sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
                    }
                    this.db.run(sql, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    insertData(table, columns, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const valuesString = values.map(value => {
                        if (value === 'NULL' || value === null || value === undefined) {
                            return 'NULL';
                        }
                        return `'${value}'`;
                    }).join(',');
                    console.log('valuesString', valuesString);
                    const columnsString = columns.join(',');
                    console.log('select query');
                    console.log(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" `);
                    this.db.all(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" `, (err, rows) => {
                        var _a, _b;
                        if (err) {
                            console.error('Error fetching data', err.message);
                            reject(err);
                        }
                        else {
                            console.log('Data:', rows);
                            if (table === 'Version' && rows.length > 0) {
                                if (((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.EndOfSupportDate) === null && values[3] === 'NULL') {
                                    resolve(false);
                                }
                                if (((_b = rows[0]) === null || _b === void 0 ? void 0 : _b.EndOfSupportDate) !== values[3]) {
                                    console.log('Record already exists but EndOfSupportDate is different');
                                    this.UpdateRecord(table, ['EndOfSupportDate'], [values[3]], 'VersionName', rows[0].VersionName);
                                    (0, Functions_1.notify_on_end_of_support_changes)(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, rows[0].EndOfSupportDate, new Date(values[3]));
                                    resolve(false);
                                }
                                else {
                                    resolve(true);
                                }
                            }
                            if ((rows === null || rows === void 0 ? void 0 : rows.length) > 0) {
                                console.log('Record already exists');
                                resolve(false);
                            }
                            // If no rows found, execute insert query
                            this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, (err) => {
                                if (err) {
                                    console.log('Error inserting data', err.message);
                                    reject(err);
                                }
                                else {
                                    console.log('Data inserted successfully');
                                    resolve(true);
                                }
                            });
                        }
                    });
                    console.log(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    // Query data
    queryData(table, columns) {
        try {
            this.db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching data', err.message);
                }
                else {
                    console.log('Data:', rows);
                }
            });
        }
        catch (err) {
            console.error('Error fetching data', err.message);
        }
    }
    UpdateRecord(table, columns, values, identifier, identifierValue) {
        try {
            this.db.run(`UPDATE ${table} SET ${columns[0]} = "${values[0]}" WHERE ${identifier} = "${identifierValue}"`, (err) => {
                if (err) {
                    console.error('Error updating data', err.message + ' ' + values[0] + ' ' + values[1]);
                }
                else {
                    console.log('EndOfSupportDate updated successfully');
                }
            });
            return true;
        }
        catch (err) {
            console.error('Error updating data', err.message);
        }
    }
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database', err.message);
            }
            else {
                console.log('Database connection closed.');
            }
        });
    }
}
exports.Database = Database;
