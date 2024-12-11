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
exports.Database = exports.Version = exports.Product = exports.Vendor = void 0;
const axios_1 = __importDefault(require("axios"));
const Data = require('./Data.json');
const Functions_1 = require("./Functions");
let idversion = -1;
const sqlite3 = require('sqlite3').verbose();
class Database {
    constructor() {
        this.db = new sqlite3.Database('./my-database.db');
        console.log(Data);
        this.HandleData();
    }
    HandleData() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const vendor of Data.Vendors) {
                yield this.createTable('Vendor', ['VendorId', 'VendorName', 'contactInfo', 'WebsiteUrl']);
                yield this.insertData('Vendor', ['VendorId', 'VendorName', 'contactInfo', 'WebsiteUrl'], [vendor.VendorId, vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);
                for (const product of vendor.Products) {
                    yield this.createTable('Product', ['ProductId', 'ProductName', 'VendorId', 'JSON_URL']);
                    yield this.insertData('Product', ['ProductId', 'ProductName', 'VendorId', 'JSON_URL'], [product.ProductId, product.ProductName, vendor.VendorId, product.JSON_URL]);
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
                        if (idversion == -1) {
                            idversion++;
                            continue;
                        }
                        let ReleaseDate_DateTime = (0, Functions_1.parseDate)(version[1]);
                        let EndOfSupportDate_DateTime = version[2].length > 4 ? (0, Functions_1.parseDate)(version[2]) : null;
                        console.log('ReleaseDate_DateTime', ReleaseDate_DateTime);
                        console.log('EndOfSupportDate_DateTime', EndOfSupportDate_DateTime);
                        //define ProductId as the foreign key from Product table
                        yield this.createTable('Version', ['VersionId', 'VersionNumber', 'ProductId', 'ReleaseDate', 'EndOfSupportDate']);
                        yield this.insertData('Version', ['VersionId', 'VersionNumber', 'ProductId', 'ReleaseDate', 'EndOfSupportDate'], [idversion++, version[0], product.ProductId, ReleaseDate_DateTime ? ReleaseDate_DateTime.toISOString() : 'NULL',
                            EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime.toISOString() : 'NULL']);
                        // Only calculate daysUntilEOS and notify if EndOfSupportDate exists
                        if (EndOfSupportDate_DateTime) {
                            const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            this.UpdateData('Version', ['EndOfSupportDate'], [EndOfSupportDate_DateTime.toISOString()]);
                            // await notify_on_end_of_support(version, daysUntilEOS);
                        }
                    }
                }
            }
            return true;
        });
    }
    createTable(table, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql;
                if (table === 'Version') {
                    sql = `CREATE TABLE IF NOT EXISTS Version (
                VersionId INTEGER,
                VersionNumber TEXT,
                ProductId INTEGER,
                ReleaseDate DATE,
                EndOfSupportDate DATE,
                FOREIGN KEY (ProductId) REFERENCES Product(ProductId)
            )`;
                }
                else {
                    const columnsString = columns.join(',');
                    sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
                }
                this.db.run(sql);
            }
            catch (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
    insertData(table, columns, values) {
        try {
            // Properly quote string values
            const valuesString = values.map(value => {
                // If value is 'NULL', return it as is
                if (value === 'NULL')
                    return 'NULL';
                // Otherwise wrap in single quotes
                return `'${value}'`;
            }).join(',');
            const columnsString = columns.join(',');
            console.log(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`);
            this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return;
                    }
                    else {
                        console.error('Error inserting data in table ', table, err.message);
                    }
                }
                else {
                    console.log('Data inserted successfully');
                }
            });
        }
        catch (err) {
            console.error('Error inserting data in table ', table, err.message);
        }
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
    UpdateData(table, columns, values) {
        try {
            const setStatements = columns.map((col, index) => {
                const value = values[index] === 'NULL' ? 'NULL' : `'${values[index]}'`;
                return `${col} = ${value}`;
            }).join(',');
            this.db.run(`UPDATE ${table} SET ${setStatements}`);
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
class Vendor {
    constructor(name, id, contactInfo, WebsiteUrl, products) {
        this.VendorName = name;
        this.VendorId = id;
        this.contactInfo = contactInfo;
        this.WebsiteUrl = WebsiteUrl;
        this.Products = products;
    }
    addProduct(product) {
        this.Products.push(product);
    }
}
exports.Vendor = Vendor;
class Product {
    constructor(id, name, vendor, versions, json_url) {
        this.ProductId = id;
        this.ProductName = name;
        this.Vendor = vendor;
        this.Versions = versions;
        this.JSON_URL = json_url;
    }
    addVersion(version) {
        this.Versions.push(version);
    }
}
exports.Product = Product;
class Version {
    constructor(id, number, product, endOfSupportDate, releaseDate) {
        this.VersionId = id;
        this.VersionNumber = number;
        this.Product = product;
        this.EndOfSupportDate = endOfSupportDate;
        this.ReleaseDate = releaseDate;
    }
    isUpToDate(version) {
        return this.VersionNumber === version.VersionNumber;
    }
}
exports.Version = Version;
const mydatabase = new Database();
