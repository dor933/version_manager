import fs from 'fs';
import axios from 'axios';
import { notify_on_end_of_support, notify_on_end_of_support_changes, notify_new_version, extract_versions_from_json } from './Functions';
import { parseDate } from './Functions';
import { DataStructure, VersionData} from './types';
import { Version } from './Classes';
const Data=require('./Data.json') as DataStructure;


let idversion = 0;
let firstiteration = true;


const sqlite3 = require('sqlite3').verbose();

class Database {
    db: any;
    constructor() {

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
                await this.createTable('Product', ['ProductId INTEGER PRIMARY KEY AUTOINCREMENT', 'ProductName TEXT', 'VendorId INTEGER', 'JSON_URL TEXT', 'FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId)']);
                await this.insertData('Product', [ 'ProductName', 'VendorId', 'JSON_URL'], [ product.ProductName, vendor.VendorId.toString(), product.JSON_URL]);

                let listofVersions:any = await axios.get(product.JSON_URL)
        
                listofVersions = extract_versions_from_json(listofVersions, vendor.VendorName);


                for(const version of listofVersions){
                    
                    //skip first iteration
                    if(firstiteration){
                        firstiteration = false;
                        continue;
                    }

                    let ReleaseDate_DateTime = parseDate(version[1]);
                    let EndOfSupportDate_DateTime = parseDate(version[2]) 


                    const Version:VersionData= {
                        VersionId: idversion,
                        VersionName: version[0],
                        ProductId: product.ProductId,
                        ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                        EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined ,
                        ProductName: product.ProductName,
                        VendorName: vendor.VendorName
                    }



                    await this.createTable('Version');              
                    await this.insertData('Version', 
                        [ 'VersionName', 'ProductId', 'ReleaseDate', 'EndOfSupportDate', 'ProductName', 'VendorName'], 
                        [
                            Version.VersionName, 
                            Version.ProductId.toString(), 
                            Version.ReleaseDate ? Version.ReleaseDate.toISOString() : 'NULL', 
                            Version.EndOfSupportDate ? Version.EndOfSupportDate.toISOString() : 'NULL',
                            Version.ProductName!,
                            Version.VendorName!
                        ] , 
                        Version
                    );



                   if (EndOfSupportDate_DateTime) {
                        const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if(daysUntilEOS <= 30 && daysUntilEOS >= 0){
                            await notify_on_end_of_support(Version, daysUntilEOS);
                        }
                    }
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

    async insertData(table: string, columns: string[], values: string[], versionData?: VersionData) {


        return new Promise((resolve, reject) => {
            try {
                const valuesString = values.map(value => {
                    if (value === 'NULL' || value === null || value === undefined) {
                        return 'NULL';
                    }
                    return `'${value}'`;
                }).join(',');
                
                const columnsString = columns.join(',');

                this.db.all(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" `, (err: Error, rows: any) => {
                    if (err) {
                        console.error('Error fetching data', err.message);
                        reject(err);
                    } else {

                                    
                        if(table === 'Version' && rows.length > 0){

                            //try to parse the EndOfSupportDate and values[3] to date   
                            const EndOfSupportDate_DateTime = parseDate(rows[0]?.EndOfSupportDate)
                            const EndOfSupportDate_DateTime_new = parseDate(values[3]);


                            if(!EndOfSupportDate_DateTime && !EndOfSupportDate_DateTime_new){
                               
                                resolve(false);
                            }
                            else if(rows[0]?.EndOfSupportDate !== values[3]){
                                console.log('Record already exists but EndOfSupportDate is different');
                                this.UpdateRecord(table, ['EndOfSupportDate'], [values[3]], 'VersionName', rows[0].VersionName);
                                notify_on_end_of_support_changes(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, EndOfSupportDate_DateTime? EndOfSupportDate_DateTime : undefined, EndOfSupportDate_DateTime_new? EndOfSupportDate_DateTime_new : undefined);   
                                resolve(false);
                            }


                            else{
                                resolve(true);
                            }
                        }
                        
                        else if(rows?.length > 0){
                            console.log('Record already exists');
                            resolve(false);
                        }

                     
                        else{

                        // If no rows found, execute insert query
                        this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, (err: Error) => {
                            if (err) {
                                console.log('Error inserting data', err.message);
                                reject(err);
                            } else {
                                console.log('Data inserted successfully');
                                if(table === 'Version'){
                              
                                    notify_new_version(versionData!);
                                }
                                resolve(true);
                            }
                        }); 
                    }
                }
                });

               
             

                
                
            
            } catch(err: any) {
                reject(err);
            }
        });
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





export {  Database };
