import fs from 'fs';
import axios from 'axios';
import { notify_on_end_of_support, notify_on_end_of_support_changes } from './Functions';
import { parseDate } from './Functions';
import { DataStructure} from './types';
const Data=require('./Data.json') as DataStructure;


let idversion = 0;
let firstiteration = true;


const sqlite3 = require('sqlite3').verbose();

class Database {
    db: any;
    constructor() {
        //delete old file 

        // if(fs.existsSync('./my-database.db')){
        //     fs.unlinkSync('./my-database.db');  
        // }

        this.db = new sqlite3.Database('./my-database.db');
        console.log(Data);
        this.HandleData();

   
        
    }

    async HandleData() : Promise<boolean> {
        for (const vendor of Data.Vendors) {
            await this.createTable( 'Vendor', ['VendorId INTEGER PRIMARY KEY AUTOINCREMENT', 'VendorName TEXT', 'contactInfo TEXT', 'WebsiteUrl TEXT']);
            await this.insertData('Vendor', ['VendorName', 'contactInfo', 'WebsiteUrl'], [ vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);

            for(const product of vendor.Products){
                firstiteration = true;
                await this.createTable('Product', ['ProductId INTEGER PRIMARY KEY AUTOINCREMENT', 'ProductName TEXT', 'VendorId INTEGER', 'JSON_URL TEXT']);
                await this.insertData('Product', [ 'ProductName', 'VendorId', 'JSON_URL'], [ product.ProductName, vendor.VendorId.toString(), product.JSON_URL]);

                let listofVersions:any = await axios.get(product.JSON_URL)
                console.log(listofVersions);
                listofVersions = listofVersions.data.plugins;
                console.log('listofVersions',listofVersions);

                //itertate over array
                for(const version of listofVersions){
                    
                    if(version.data.contents!== undefined){

                        listofVersions = version.data.contents;
                        console.log('listofVersions',listofVersions);
                    }
                }


                for(const version of listofVersions){
                    
                    //skip first iteration
                    if(firstiteration){
                        firstiteration = false;
                        continue;
                    }

                    let ReleaseDate_DateTime = parseDate(version[1]);
                    let EndOfSupportDate_DateTime = parseDate(version[2]) 


                    console.log('ReleaseDate_DateTime',ReleaseDate_DateTime);
                    console.log('EndOfSupportDate_DateTime',EndOfSupportDate_DateTime);



                    //define ProductId as the foreign key from Product table
                    await this.createTable('Version');              
                    await this.insertData('Version', 
                        [ 'VersionName', 'ProductId', 'ReleaseDate', 'EndOfSupportDate', 'ProductName', 'VendorName'], 
                        [
                            version[0], 
                            product.ProductId, 
                            ReleaseDate_DateTime ? ReleaseDate_DateTime.toISOString() : 'NULL', 
                            EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime.toISOString() : 'NULL',
                            product.ProductName,
                            vendor.VendorName
                        ]
                    );



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

        
    }

   async createTable(table?: string, columns?: string[]) {
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
                } else {
                    const columnsString = columns!.join(',');
                    sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
                }
                this.db.run(sql, (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            } catch(err: any) {
                reject(err);
            }
        });
    }

    async insertData(table: string, columns: string[], values: string[]) {


        return new Promise((resolve, reject) => {
            try {
                const valuesString = values.map(value => {
                    if (value === 'NULL' || value === null || value === undefined) {
                        return 'NULL';
                    }
                    return `'${value}'`;
                }).join(',');

                console.log('valuesString',valuesString);
                
                const columnsString = columns.join(',');
                console.log('select query')

                console.log(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" `);

                this.db.all(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" `, (err: Error, rows: any) => {
                    if (err) {
                        console.error('Error fetching data', err.message);
                        reject(err);
                    } else {
                        console.log('Data:', rows);

                                     

                        if(table === 'Version' && rows.length > 0){

                            if(rows[0]?.EndOfSupportDate === null && values[3] === 'NULL'){
                                resolve(false);
                            }
                            if(rows[0]?.EndOfSupportDate !== values[3]){
                                console.log('Record already exists but EndOfSupportDate is different');
                                this.UpdateRecord(table, ['EndOfSupportDate'], [values[3]], 'VersionName', rows[0].VersionName);
                                notify_on_end_of_support_changes(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, rows[0].EndOfSupportDate, new Date(values[3]));   
                                resolve(false);
                            }
                                else{
                                resolve(true);
                            }
                        }
                        
                        if(rows?.length > 0){
                            console.log('Record already exists');
                            resolve(false);
                        }

                     

                        // If no rows found, execute insert query
                        this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, (err: Error) => {
                            if (err) {
                                console.log('Error inserting data', err.message);
                                reject(err);
                            } else {
                                console.log('Data inserted successfully');
                                resolve(true);
                            }
                        }); 
                    }
                });

               
             

                
                console.log(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`);
                
            
            } catch(err: any) {
                reject(err);
            }
        });
    }



// Query data
    queryData(table: string, columns: string) {
        try{

        this.db.all(`SELECT * FROM ${table}`, [], (err:Error, rows:any) => {
            if (err) {
                console.error('Error fetching data', err.message);
            } else {
                console.log('Data:', rows);
            }
        });
    }
    catch(err:any){
        console.error('Error fetching data', err.message);
    }
    } 



    


    
  
    
   UpdateRecord(table: string, columns: string[], values: string[], identifier: string, identifierValue: string) {
    try{
        this.db.run(`UPDATE ${table} SET ${columns[0]} = "${values[0]}" WHERE ${identifier} = "${identifierValue}"`, (err: Error) => {
            if (err) {
                console.error('Error updating data', err.message + ' ' + values[0] + ' ' + values[1]);
            } else {
                console.log('EndOfSupportDate updated successfully');
            }
        });
        return true;


    }
    catch(err:any){
        console.error('Error updating data', err.message);
    }
   }
    

    close() {
        this.db.close((err:Error) => {
            if (err) {
                console.error('Error closing database', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}





export {  Database, };

