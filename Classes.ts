import fs from 'fs';
import axios from 'axios';
import { notify_on_end_of_support } from './Functions';
const Data=require('./Data.json');
import { parseDate } from './Functions';

let idversion = -1;


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
            await this.createTable( 'Vendor', ['VendorId', 'VendorName', 'contactInfo', 'WebsiteUrl']);
            await this.insertData('Vendor', ['VendorId', 'VendorName', 'contactInfo', 'WebsiteUrl'], [vendor.VendorId, vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);

            for(const product of vendor.Products){
                await this.createTable('Product', ['ProductId', 'ProductName', 'VendorId', 'JSON_URL']);
                await this.insertData('Product', ['ProductId', 'ProductName', 'VendorId', 'JSON_URL'], [product.ProductId, product.ProductName, vendor.VendorId, product.JSON_URL]);

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
                    if(idversion == -1){
                        idversion++;
                        continue;
                    }

                    let ReleaseDate_DateTime = parseDate(version[1]);
                    let EndOfSupportDate_DateTime = version[2].length>4  ? parseDate(version[2]) : null;


                    console.log('ReleaseDate_DateTime',ReleaseDate_DateTime);
                    console.log('EndOfSupportDate_DateTime',EndOfSupportDate_DateTime);



                    //define ProductId as the foreign key from Product table
                    await this.createTable('Version', ['VersionId', 'VersionNumber', 'ProductId', 'ReleaseDate', 'EndOfSupportDate']);              
                    await this.insertData('Version', 
                        ['VersionId', 'VersionNumber', 'ProductId', 'ReleaseDate', 'EndOfSupportDate'], 
                        [idversion++, version[0], product.ProductId, ReleaseDate_DateTime ? ReleaseDate_DateTime.toISOString() : 'NULL', 
                        EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime.toISOString() : 'NULL']
                    );



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

        
    }

   async createTable(table: string, columns: string[]) {

        try{

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
        } else {
            const columnsString = columns.join(',');
            sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
        }
        this.db.run(sql);
    }
    catch(err:any){
            console.error('Error creating table', err.message);
        }
    }

    insertData(table: string, columns: string[], values: string[]) {
        try {
            // Properly quote string values
            const valuesString = values.map(value => {
                // If value is 'NULL', return it as is
                if (value === 'NULL') return 'NULL';
                // Otherwise wrap in single quotes
                return `'${value}'`;
            }).join(',');
            
            const columnsString = columns.join(',');
            
            console.log(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`);
            
            this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, function(err: Error) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return;
                    } else {
                        console.error('Error inserting data in table ', table, err.message);
                    }
                } else {
                    console.log('Data inserted successfully');
                }
            });
        } catch(err: any) {
            console.error('Error inserting data in table ', table, err.message);
        }
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



    


    
  
    
    UpdateData(table: string, columns: string[], values: string[]) {
        try{

        const setStatements = columns.map((col, index) => {
            const value = values[index] === 'NULL' ? 'NULL' : `'${values[index]}'`;
            return `${col} = ${value}`;
        }).join(',');
        
        this.db.run(`UPDATE ${table} SET ${setStatements}`);
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


class Vendor {
    VendorId:number;
    VendorName: string;
    contactInfo: string;
    WebsiteUrl: Text        ;
    Products: Product[];
    
    constructor(name: string, id: number, contactInfo: string, WebsiteUrl: Text, products: Product[]) {
        this.VendorName = name;
        this.VendorId = id;
        this.contactInfo = contactInfo;
        this.WebsiteUrl = WebsiteUrl;
        this.Products = products;
    }

    addProduct(product: Product) {
        this.Products.push(product);
    }
}

class Product {
    ProductId: number;
    ProductName: string;
    Vendor: Vendor;
    Versions: Version[];
    JSON_URL: string;

    constructor(id: number, name: string, vendor: Vendor, versions: Version[], json_url: string) {
        this.ProductId = id;
        this.ProductName = name;
        this.Vendor = vendor;
        this.Versions = versions;
        this.JSON_URL = json_url;
    }

    addVersion(version: Version) {
        this.Versions.push(version);
    }
}

class Version {
    VersionId: number;
    VersionNumber: string;
    Product: Product;
    ReleaseDate: Date;
    EndOfSupportDate: Date; 

    constructor(id: number, number: string, product: Product, endOfSupportDate: Date, releaseDate: Date ) {
        this.VersionId = id;
        this.VersionNumber = number;
        this.Product = product;
        this.EndOfSupportDate = endOfSupportDate;
        this.ReleaseDate = releaseDate;
    }

    isUpToDate(version: Version) {
        return this.VersionNumber === version.VersionNumber;
    }
}


const mydatabase= new Database();

export { Vendor, Product, Version, Database };

