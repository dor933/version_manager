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
const Data = require('../../Data.json');
const index_1 = require("./index");
const Functions_3 = require("./Functions");
const sqlite3 = require('sqlite3').verbose();
class Database {
    constructor() {
        this.db = new sqlite3.Database('./my-database.db');
    }
    HandleData(isinit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createTable('User', ['Id INTEGER PRIMARY KEY AUTOINCREMENT', 'Email TEXT UNIQUE', 'Role TEXT']);
                yield this.createTable('User_Chosen_Products', [
                    'UserID INTEGER',
                    'ProductName TEXT',
                    'VendorName TEXT',
                    'Unit_of_time TEXT CHECK(Unit_of_time IN ("Days", "Months", "Hours"))',
                    'Frequency TEXT',
                    'Last_Update TEXT',
                    'PRIMARY KEY (UserID, ProductName, VendorName)',
                    'FOREIGN KEY (UserID) REFERENCES User(Id)',
                    'FOREIGN KEY (ProductName, VendorName) REFERENCES Product(ProductName, VendorName)'
                ]);
                yield this.createTable('Vendor', ['VendorName TEXT PRIMARY KEY', 'contactInfo TEXT', 'WebsiteUrl TEXT']);
                yield this.createTable('Product', [
                    'ProductName TEXT',
                    'VendorName TEXT NOT NULL',
                    'JSON_URL TEXT',
                    'release_notes TEXT',
                    'PRIMARY KEY (ProductName, VendorName)',
                    'FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName)'
                ]);
                yield this.createTable('Version', ['VersionName TEXT', 'ProductName TEXT', 'VendorName TEXT', 'ReleaseDate DATE', 'EndOfSupportDate DATE', 'LevelOfSupport TEXT', 'Extended_Support_End_Date DATE', 'EOSL_Start_Date DATE', 'full_release_notes TEXT', 'Timestamp DATE', 'FOREIGN KEY (ProductName) REFERENCES Product(ProductName)', 'FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName)', 'PRIMARY KEY (VersionName, ProductName, VendorName)']);
                yield this.createTable('Module', ['ModuleName TEXT', 'ProductName TEXT', 'VendorName TEXT', 'PRIMARY KEY (ModuleName, ProductName, VendorName)', 'FOREIGN KEY (ProductName, VendorName) REFERENCES Product(ProductName, VendorName)']);
                yield this.createTable('Issues', [
                    'IssueId INTEGER PRIMARY KEY AUTOINCREMENT',
                    'ModuleName TEXT',
                    'ProductName TEXT',
                    'VendorName TEXT',
                    'VersionName TEXT',
                    'Issue TEXT',
                    'Date_field DATE',
                    'Ratification INTEGER',
                    'Resolution TEXT',
                    'UserId INTEGER',
                    'Email TEXT',
                    'Severity TEXT',
                    'FOREIGN KEY (ModuleName) REFERENCES Module(ModuleName)',
                    'FOREIGN KEY (ProductName, VendorName) REFERENCES Product(ProductName, VendorName)',
                    'FOREIGN KEY (VersionName) REFERENCES Version(VersionName)',
                    'FOREIGN KEY (UserId) REFERENCES User(Id)',
                    'FOREIGN KEY (Email) REFERENCES User(Email)'
                ]);
                for (const vendor of Data.Vendors) {
                    yield this.insertData('Vendor', ['VendorName', 'contactInfo', 'WebsiteUrl'], [vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);
                    for (const product of vendor.Products) {
                        yield this.insertData('Product', ['ProductName', 'VendorName', 'JSON_URL', 'release_notes'], [product.ProductName, vendor.VendorName, product.JSON_URL, product.release_notes]);
                        for (const module of (product === null || product === void 0 ? void 0 : product.modules) || []) {
                            yield this.insertData('Module', ['ModuleName', 'ProductName', 'VendorName'], [module, product.ProductName, vendor.VendorName]);
                        }
                        let listofversions = [];
                        if (vendor.VendorName === 'Fortra') {
                            listofversions = yield (0, Functions_3.extract_fortra_versions)(product.ProductName);
                        }
                        else {
                            if (product.BASE_URL) {
                                try {
                                    const ids = yield (0, Functions_1.extract_JSON_URL)(product.JSON_URL);
                                    console.log('id', ids);
                                    const merged_listofversions = [];
                                    for (const index of ids) {
                                        const jsonRequest = product.BASE_URL + index;
                                        let listofversionstemp = yield axios_1.default.get(jsonRequest);
                                        listofversionstemp = (0, Functions_1.extract_versions_from_json)(listofversionstemp, vendor.VendorName, product.ProductName);
                                        index_1.logger.info('listofversionstemp', listofversionstemp);
                                        merged_listofversions.push(...listofversionstemp);
                                    }
                                    listofversions = merged_listofversions;
                                }
                                catch (error) {
                                    index_1.logger.error('Error fetching data:', error);
                                    throw error;
                                }
                            }
                            else {
                                listofversions = yield axios_1.default.get(product.JSON_URL);
                                listofversions = (0, Functions_1.extract_versions_from_json)(listofversions, vendor.VendorName, product.ProductName);
                            }
                        }
                        let index = 0;
                        for (const version of listofversions) {
                            let UsersArray = yield this.GetUsersArray(product.ProductName, vendor.VendorName, version[0]);
                            let ReleaseDate_DateTime = (0, Functions_2.parseDate)(version[1]);
                            let EndOfSupportDate_DateTime = (0, Functions_2.parseDate)(version[2]);
                            let LevelOfSupport = version[3];
                            let ExtendedEndOfSupportDate = (0, Functions_2.parseDate)(version[4]);
                            let EOSL_Start_Date = (0, Functions_2.parseDate)(version[5]);
                            let release_notes;
                            if (vendor.VendorName === 'OPSWAT') {
                                if (index !== 0) {
                                    if (product.ProductName === 'Metadefender_Core') {
                                        release_notes = product.release_notes + '/archived-release-notes#version-v' +
                                            version[0].replace(/Version |[Vv]|\./g, '');
                                        console.log('release_notes', release_notes);
                                    }
                                    else {
                                        release_notes = product.archive_release_notes;
                                    }
                                }
                                else {
                                    release_notes = product.release_notes;
                                }
                            }
                            else if (vendor.VendorName === 'Fortra') {
                                release_notes = product.release_notes;
                            }
                            const Version = {
                                VersionName: version[0],
                                ProductName: product.ProductName,
                                VendorName: vendor.VendorName,
                                ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                                EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined,
                                LevelOfSupport: LevelOfSupport ? LevelOfSupport : undefined,
                                Extended_Support_End_Date: ExtendedEndOfSupportDate ? ExtendedEndOfSupportDate : undefined,
                                EOSL_Start_Date: EOSL_Start_Date ? EOSL_Start_Date : undefined,
                                release_notes: release_notes
                            };
                            yield this.insertData('Version', ['VersionName', 'ProductName', 'VendorName', 'ReleaseDate', 'EndOfSupportDate', 'LevelOfSupport', 'Extended_Support_End_Date', 'EOSL_Start_Date', 'full_release_notes', 'Timestamp'], [
                                Version.VersionName,
                                Version.ProductName,
                                Version.VendorName,
                                Version.ReleaseDate ? Version.ReleaseDate.toISOString() : 'NULL',
                                Version.EndOfSupportDate ? Version.EndOfSupportDate.toISOString() : 'NULL',
                                Version.LevelOfSupport ? Version.LevelOfSupport : 'NULL',
                                Version.Extended_Support_End_Date ? Version.Extended_Support_End_Date.toISOString() : 'NULL',
                                Version.EOSL_Start_Date ? Version.EOSL_Start_Date.toISOString() : 'NULL',
                                Version.release_notes ? Version.release_notes : 'NULL',
                                new Date().toISOString()
                            ], Version, UsersArray);
                            if (EndOfSupportDate_DateTime) {
                                let daysUntilExtendedEOS;
                                const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (ExtendedEndOfSupportDate) {
                                    daysUntilExtendedEOS = Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                }
                                if ((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS < 14) {
                                    (0, Functions_1.notify_on_end_of_support)(Version, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, UsersArray);
                                }
                            }
                            index++;
                        }
                    }
                }
                index_1.logger.info('Successfully completed version check');
                return true;
            }
            catch (error) {
                index_1.logger.error('Error in HandleData', error);
                return error;
            }
        });
    }
    createTable(table, columns) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let sql;
                    const columnsString = columns.join(',');
                    sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
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
    insertData(table, columns, values, versionData, UsersArrayes) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const valuesString = values.map(value => {
                        if (value === 'NULL' || value === null || value === undefined) {
                            return 'NULL';
                        }
                        return `'${value}'`;
                    }).join(',');
                    const columnsString = columns.join(',');
                    this.db.all(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" ${table === 'Version' ? `AND ${columns[2]} = "${values[2]}"` : ''} `, (err, rows) => {
                        var _a, _b;
                        if (err) {
                            console.error('Error fetching data', err.message);
                            reject(err);
                        }
                        else {
                            if (table === 'Version' && rows.length > 0) {
                                //parse the EndOfSupportDate and values[3] to date   
                                const EndOfSupportDate_DateTime = (0, Functions_2.parseDate)((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.EndOfSupportDate);
                                const EndOfSupportDate_DateTime_new = (0, Functions_2.parseDate)(values[4]);
                                this.UpdateRecord('Version', ['full_release_notes'], [values[8]], ['VersionName'], [rows[0].VersionName]);
                                if (!EndOfSupportDate_DateTime && !EndOfSupportDate_DateTime_new) {
                                    resolve(false);
                                }
                                else if (((_b = rows[0]) === null || _b === void 0 ? void 0 : _b.EndOfSupportDate) !== values[4]) {
                                    this.UpdateRecord(table, ['EndOfSupportDate'], [values[4]], ['VersionName'], [rows[0].VersionName]);
                                    (0, Functions_1.notify_on_end_of_support_changes)(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined, EndOfSupportDate_DateTime_new ? EndOfSupportDate_DateTime_new : undefined, UsersArrayes);
                                    resolve(false);
                                }
                                else {
                                    resolve(true);
                                }
                            }
                            else if ((rows === null || rows === void 0 ? void 0 : rows.length) > 0) {
                                resolve(false);
                            }
                            else {
                                // If no rows found, execute insert query
                                this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, (err) => {
                                    if (err) {
                                        console.error('Error inserting data', err.message);
                                        reject(err);
                                    }
                                    else {
                                        if (table === 'Version') {
                                            (0, Functions_1.notify_new_version)(versionData, UsersArrayes);
                                        }
                                        resolve(true);
                                    }
                                });
                            }
                        }
                    });
                }
                catch (err) {
                    index_1.logger.error('Error inserting data', err.message);
                    reject(err);
                }
            });
        });
    }
    UpdateRecord(table, columns, values, whereColumn, whereValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    // Create placeholders for the values
                    const setClause = columns.map(col => `${col} = ?`).join(', ');
                    const whereClause = whereColumn.map(col => `${col} = ?`).join(' AND ');
                    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
                    // Escape special characters in values
                    const sanitizedValues = values.map(value => typeof value === 'string' ? value.replace(/'/g, "''") : value);
                    const sanitizedWhereValues = whereValue.map(value => typeof value === 'string' ? value.replace(/'/g, "''") : value);
                    // Add the whereValue to the values array
                    sanitizedValues.push(...sanitizedWhereValues);
                    index_1.logger.info('sanitizedValues' + sanitizedValues);
                    index_1.logger.info('query' + query);
                    this.db.run(query, sanitizedValues, (err) => {
                        if (err) {
                            index_1.logger.error('Error updating record:', err);
                            reject(err);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                catch (err) {
                    index_1.logger.error('Error in UpdateRecord:', err);
                    reject(err);
                }
            });
        });
    }
    getVersions(vendor, product, version) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM Version ${vendor ? `WHERE VendorName='${vendor}'` : ''} ${product ? ` AND ProductName='${product}'` : ''} ${version ? ` AND VersionName='${version}'` : ''}`, (err, rows) => {
                    resolve(rows);
                });
            });
        });
    }
    getProducts(vendor, product) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM Product ${vendor ? `WHERE VendorName='${vendor}'` : ''} ${product ? ` AND ProductName='${product}'` : ''}`, (err, rows) => {
                    resolve(rows);
                });
            });
        });
    }
    GetUsersArray(product, vendor, version) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let query = `SELECT U.Email,UC.Last_Update, UC.Unit_of_time, UC.Frequency, UC.UserID, UC.ProductName, UC.VendorName FROM User_Chosen_Products UC INNER JOIN User U ON UC.UserID=U.Id WHERE UC.ProductName='${product}' AND UC.VendorName='${vendor}'`;
                    this.db.all(query, (err, rows) => {
                        if (err) {
                            index_1.logger.error('Error getting users array', err.message);
                            reject(err);
                        }
                        let users_to_update = rows.map((row) => {
                            return {
                                Email: row.Email,
                                Last_Update: row.Last_Update,
                                Unit_of_time: row.Unit_of_time,
                                Frequency: row.Frequency,
                                UserID: row.UserID,
                                ProductName: row.ProductName,
                                VendorName: row.VendorName
                            };
                        });
                        resolve(users_to_update);
                    });
                }
                catch (err) {
                    index_1.logger.error('Error getting users array', err.message);
                    reject(err);
                }
            });
        });
    }
    getmodules(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM Module WHERE ProductName='${product}' AND VendorName='${vendor}'`, (err, rows) => {
                    resolve(rows);
                });
            });
        });
    }
    getissues(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM Issues WHERE ProductName='${product}' AND VendorName='${vendor}'`, (err, rows) => {
                    resolve(rows);
                });
            });
        });
    }
    subscribe(userid, product, vendor, Unit_of_time, Frequency) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    // First check if record exists
                    const checkQuery = `SELECT COUNT(*) as count FROM User_Chosen_Products 
                WHERE UserID = ? AND ProductName = ? AND VendorName = ? AND (Unit_of_time <> ? OR Frequency <> ?)`;
                    // Then do the insert with proper error handling
                    this.db.get(checkQuery, [userid, product, vendor, Unit_of_time, Frequency], (err, row) => {
                        if (err) {
                            index_1.logger.error('Error checking for existing subscription:', err);
                            reject({ error: 'Database error', details: err });
                            return;
                        }
                        if (row.count > 0) {
                            this.db.run(`UPDATE User_Chosen_Products SET Unit_of_time='${Unit_of_time}', Frequency='${Frequency}' WHERE UserID='${userid}' AND ProductName='${product}' AND VendorName='${vendor}'`, (err) => {
                                if (err) {
                                    index_1.logger.error('Error updating subscription:', err);
                                    reject({ error: 'Database error', details: err });
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        }
                        else {
                            const insertQuery = `INSERT INTO User_Chosen_Products 
                    (UserID, ProductName, VendorName, Unit_of_time, Frequency, Last_Update) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
                            const oneYearAgo = new Date();
                            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                            const oneYearAgoISO = oneYearAgo.toISOString();
                            this.db.run(insertQuery, [userid, product, vendor, Unit_of_time, Frequency, oneYearAgoISO], (err) => {
                                if (err) {
                                    index_1.logger.error('Error inserting subscription:', err);
                                    reject({ error: 'Database error', details: err });
                                    return;
                                }
                                resolve({ success: true, message: 'Subscription added' });
                            });
                        }
                    });
                }
                catch (err) {
                    reject(false);
                }
            });
        });
    }
    registerUser(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = '';
            query = `INSERT INTO User (Email ${role ? ',Role' : ''} ) VALUES ('${email}' ${role ? `,'${role}'` : ''})`;
            console.log(query);
            return new Promise((resolve, reject) => {
                try {
                    this.db.run(query, (err) => {
                        if (err) {
                            console.error('Error registering user', err.message);
                            reject(false);
                        }
                        else {
                            console.log('User registered successfully');
                            resolve(true);
                        }
                    });
                }
                catch (err) {
                    reject(false);
                }
            });
        });
    }
    checkUserSubscription(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM User U INNER JOIN User_Chosen_Products UC ON UC.UserID=U.Id WHERE UC.ProductName='${product}' AND UC.VendorName='${vendor}'`, (err, rows) => {
                    resolve(rows.length > 0);
                });
            });
        });
    }
    CheckUserExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.all(`SELECT * FROM User WHERE Email='${email}'`, (err, rows) => {
                    if (rows.length > 0) {
                        resolve(parseInt(rows[0].Id));
                    }
                    else {
                        resolve(0);
                    }
                });
            });
        });
    }
    report(vendor, product, version, module, email, severity, issueDescription, userid, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.run(`INSERT INTO Issues (VendorName, ProductName, VersionName, ModuleName, Email, ${rule ? 'Rule, ' : ''} Severity, Issue, Date_field, UserId, Ratification) 
             VALUES (?, ?, ?, ?, ?, ${rule ? '?,' : ''} ?, ?, ?, ?, 1)`, [
                    vendor, product, version, module, email,
                    ...(rule ? [rule] : []),
                    severity, issueDescription,
                    new Date().toISOString(), userid
                ], function (err) {
                    if (err) {
                        console.error('Error reporting issue', err.message);
                        reject(false);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}
exports.Database = Database;
