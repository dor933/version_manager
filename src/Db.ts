import axios from 'axios';
import { notify_on_end_of_support, notify_on_end_of_support_changes, notify_new_version, extract_versions_from_json,extract_fortra_versions_to_json, extract_JSON_URL } from './Functions';
import { parseDate } from './Functions';
import { DataStructure, VersionData, version_extracted} from './types';
const path = require('path');
const Data=require('../Data.json') as DataStructure;
import { logger } from './index';
import puppeteer from 'puppeteer';






async function extract_fortra_versions(productname:string):Promise<version_extracted[]>{

    let listoffortraversions= await extract_fortra_versions_to_json('https://api.portal.fortra.com/kbarticles/goanywhere-mft-end-of-support-life-policy-and-supported-versions-OWMyY2VkZTktZGFmMS1lZTExLTkwNGMtMDAyMjQ4MGFlMjg0?productSlug=goanywhere-mft');
    
    
    let fortra_version_extracted:version_extracted[]=[]
    let listnew= listoffortraversions[productname];
   

    for(const version of listnew){
            fortra_version_extracted.push([
                version.version_name,
                version.release_date,
                version.end_of_support_date,
                version.level_of_support,
                version.extended_support_end_date,
                version.eosl_start_date
            ])
        
      }

      return fortra_version_extracted;

    }
    



const sqlite3 = require('sqlite3').verbose();

class Database {
    db: any;
    constructor() {

        this.db = new sqlite3.Database( './my-database.db');
      

   
        
    }

    async HandleData(isinit?:boolean) : Promise<boolean | any> {

        let listoffortraversions:version_extracted[]=[]
        try{


        for (const vendor of Data.Vendors) {
            let mailboxes= await this.GetMailBoxes(vendor.VendorName);
            console.log('mailboxes', mailboxes);

            if(vendor.VendorName==='Fortra'){
                listoffortraversions=await extract_fortra_versions_to_json(vendor.JSON_URL!);

            }

            await this.createTable( 'Vendor', ['VendorName TEXT PRIMARY KEY', 'contactInfo TEXT', 'WebsiteUrl TEXT']);
          await this.insertData('Vendor', ['VendorName', 'contactInfo', 'WebsiteUrl'], [ vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);

         

            for(const product of vendor.Products){


                await this.createTable('Product', [
                    'ProductName TEXT',
                    'VendorName TEXT NOT NULL',
                    'JSON_URL TEXT',
                    'PRIMARY KEY (ProductName, VendorName)',
                    'FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName)'
                ]);
                await this.insertData('Product', [ 'ProductName', 'VendorName', 'JSON_URL'], [ product.ProductName, vendor.VendorName, product.JSON_URL!]);

                let listofversions:version_extracted[]=[]

                if(vendor.VendorName==='Fortra'){
                    listofversions=await extract_fortra_versions(product.ProductName);
                 
                }

                else{
                   
                    if(product.BASE_URL){
                        try {
                            const id = await extract_JSON_URL(product.JSON_URL!);
                            console.log('id', id);
                            const jsonRequest = product.BASE_URL! + id;
                            console.log('json_url', jsonRequest);
                            listofversions = await axios.get(jsonRequest);
                        } catch (error) {
                            console.error('Error fetching data:', error);
                            throw error;
                        }
                    }
                    else{
                        listofversions = await axios.get(product.JSON_URL!)
                    }
                    listofversions = extract_versions_from_json(listofversions, vendor.VendorName, product.ProductName)
                    console.log('listofversions', listofversions);
                }
        


                for(const version of listofversions){
                    
                   

                    let ReleaseDate_DateTime = parseDate(version[1]!);
                    let EndOfSupportDate_DateTime = parseDate(version[2]!) 
                    let LevelOfSupport= version[3]
                    let ExtendedEndOfSupportDate= parseDate(version[4]!);
                    let EOSL_Start_Date= parseDate(version[5]!);


                    const Version:VersionData= {
                        VersionName: version[0],
                        ProductName: product.ProductName,
                        VendorName: vendor.VendorName,
                        ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                        EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined ,
                        LevelOfSupport: LevelOfSupport? LevelOfSupport:undefined,
                        Extended_Support_End_Date: ExtendedEndOfSupportDate? ExtendedEndOfSupportDate:undefined,
                        EOSL_Start_Date: EOSL_Start_Date? EOSL_Start_Date:undefined
                    }



                    await this.createTable('Version');              
                    await this.insertData('Version', 
                        [ 'VersionName', 'ProductName', 'VendorName', 'ReleaseDate', 'EndOfSupportDate', 'LevelOfSupport', 'Extended_Support_End_Date','EOSL_Start_Date'], 
                        [
                            Version.VersionName, 
                            Version.ProductName!,
                            Version.VendorName!,
                            Version.ReleaseDate ? Version.ReleaseDate.toISOString() : 'NULL', 
                            Version.EndOfSupportDate ? Version.EndOfSupportDate.toISOString() : 'NULL',
                            Version.LevelOfSupport? Version.LevelOfSupport : 'NULL',
                            Version.Extended_Support_End_Date? Version.Extended_Support_End_Date.toISOString() : 'NULL',
                            Version.EOSL_Start_Date? Version.EOSL_Start_Date.toISOString() : 'NULL'
                        ] , 
                        Version,
                        mailboxes
                    );



                   if (EndOfSupportDate_DateTime) {

                     let daysUntilExtendedEOS
                        const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if(ExtendedEndOfSupportDate){
                             daysUntilExtendedEOS= Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        }
                        if((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS <14){
                         notify_on_end_of_support(Version, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, mailboxes);
                        }
                    }
                }
            }
        }
        logger.info('Successfully completed version check');
        return true;
    }
    catch(error){
   
        return error;
    }

        
    }

   async createTable(table?: string, columns?: string[]) {
        return new Promise((resolve, reject) => {
            try {
                let sql;
                if (table === 'Version') {
                    sql = `CREATE TABLE IF NOT EXISTS Version (
                        VersionName TEXT,
                        ProductName TEXT,
                        VendorName TEXT,
                        ReleaseDate DATE,
                        EndOfSupportDate DATE,
                        LevelOfSupport TEXT,
                        Extended_Support_End_Date DATE,
                        EOSL_Start_Date DATE,
                        FOREIGN KEY (ProductName) REFERENCES Product(ProductName),
                        FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName),
                        PRIMARY KEY (VersionName, ProductName, VendorName)
                    )`;
                } else {
                    const columnsString = columns!.join(',');
                    sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
                    console.log(sql);
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

    async insertData(table: string, columns: string[], values: string[], versionData?: VersionData, mailboxes?: any) {
        


        return new Promise((resolve, reject) => {
            try {
                const valuesString = values.map(value => {
                    if (value === 'NULL' || value === null || value === undefined) {
                        return 'NULL';
                    }
                    return `'${value}'`;
                }).join(',');
                
                const columnsString = columns.join(',');


                this.db.all(`SELECT * FROM ${table} WHERE ${columns[0]} = "${values[0]}" AND ${columns[1]} = "${values[1]}" ${table==='Version' ? `AND ${columns[2]} = "${values[2]}"` : ''} `, (err: Error, rows: any) => {
                    if (err) {
                        console.error('Error fetching data', err.message);
                        reject(err);
                    } else {
                    
                                    
                        if(table === 'Version' && rows.length > 0){

                            //try to parse the EndOfSupportDate and values[3] to date   
                            const EndOfSupportDate_DateTime = parseDate(rows[0]?.EndOfSupportDate)
                            const EndOfSupportDate_DateTime_new = parseDate(values[4]);


                            if(!EndOfSupportDate_DateTime && !EndOfSupportDate_DateTime_new){
                               
                                resolve(false);
                            }
                            else if(rows[0]?.EndOfSupportDate !== values[4]){
                                this.UpdateRecord(table, ['EndOfSupportDate'], [values[4]], 'VersionName', rows[0].VersionName);
                                notify_on_end_of_support_changes(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, EndOfSupportDate_DateTime? EndOfSupportDate_DateTime : undefined, EndOfSupportDate_DateTime_new? EndOfSupportDate_DateTime_new : undefined, mailboxes);   
                                resolve(false);
                            }


                            else{
                                resolve(true);
                            }
                        }
                        
                        else if(rows?.length > 0){
                            resolve(false);
                        }

                     
                        else{

                        // If no rows found, execute insert query
                        this.db.run(`INSERT INTO ${table} (${columnsString}) VALUES (${valuesString})`, (err: Error) => {
                            if (err) {
                                console.error('Error inserting data', err.message);
                                reject(err);
                            } else {
                                if(table === 'Version'){
                              
                                    notify_new_version(versionData!, mailboxes);
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
            }
        });
        return true;


    }
    catch(err:any){
        console.error('Error updating data', err.message);
    }
   }

   async getVersions(){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Version`, (err: Error, rows: any) => {
            resolve(rows);
        });
    });
    
   }

   async GetMailBoxes(vendor:string){

    let field= vendor === 'Fortra' ? 'Fortra_Notifications' : 'OPSW_Notifications';

    return new Promise((resolve, reject) => {
        this.db.all(`SELECT Email FROM User WHERE ${field}=1`, (err: Error, rows: any) => {

            let mails= rows.map((row:any)=>row.Email).join(',');
            console.log('mails', mails);
            resolve(mails);
        });
    });
   }

   async subscribe(vendor:string, email:string){



    let field= vendor === 'Fortra' ? 'Fortra_Notifications' : vendor==='OPSWAT' ? 'OPSW_Notifications' : 'All';
    let field_to_0= vendor==='Fortra' ? 'OPSW_Notifications' : 'Fortra_Notifications';

    let query='';

        if(field==='All'){
            query=`INSERT INTO User (Email, Fortra_Notifications, OPSW_Notifications) VALUES ("${email}", 1, 1)`;   
        }
        else{
            query=`INSERT INTO User (Email, ${field}, ${field_to_0}) VALUES ("${email}", 1, 0)`;
            console.log('query', query);
        }
        return new Promise((resolve, reject) => {

            try{
                this.db.run(query, () => {
             
                resolve(true);
            }) 
            }
            catch(err:any){
                reject(false);
                }
        });
    }

   async checkUser(email:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM User WHERE Email = '${email}'`, (err: Error, rows: any) => {
            resolve(rows.length > 0);
        });
    });
   }


    

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}





export {  Database };

