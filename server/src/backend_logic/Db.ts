import axios from 'axios';
import { notify_on_end_of_support, notify_on_end_of_support_changes, notify_new_version, extract_versions_from_json,extract_fortra_versions_to_json, extract_JSON_URL } from './Functions';
import { parseDate } from './Functions';
import { DataStructure, VersionData } from '../Types/MainDataTypes';
const Data=require('../../Data.json') as DataStructure;
import { logger } from './index';
import { version_extracted } from '../Types/WebTypes';
import { extract_fortra_versions } from './Functions';



const sqlite3 = require('sqlite3').verbose();

class Database {
    db: any;
    constructor() {

        this.db = new sqlite3.Database( './my-database.db');
    
    }

    async HandleData(isinit?:boolean) : Promise<boolean | any> {

        try{

           await  this.createTable('User', ['Id INTEGER PRIMARY KEY AUTOINCREMENT', 'Email TEXT UNIQUE', 'Role TEXT']);

            await this.createTable('User_Chosen_Products', [
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

            await this.createTable( 'Vendor', ['VendorName TEXT PRIMARY KEY', 'contactInfo TEXT', 'WebsiteUrl TEXT']);
            await this.createTable('Product', [
                'ProductName TEXT',
                'VendorName TEXT NOT NULL',
                'JSON_URL TEXT',
                'release_notes TEXT',
                'PRIMARY KEY (ProductName, VendorName)',
                'FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName)'
            ]);

            await this.createTable('Version',['VersionName TEXT', 'ProductName TEXT', 'VendorName TEXT', 'ReleaseDate DATE', 'EndOfSupportDate DATE', 'LevelOfSupport TEXT', 'Extended_Support_End_Date DATE', 'EOSL_Start_Date DATE', 'full_release_notes TEXT', 'Timestamp DATE', 'FOREIGN KEY (ProductName) REFERENCES Product(ProductName)', 'FOREIGN KEY (VendorName) REFERENCES Vendor(VendorName)', 'PRIMARY KEY (VersionName, ProductName, VendorName)'] );              


            await this.createTable('Module', [ 'ModuleName TEXT', 'ProductName TEXT', 'VendorName TEXT', 'PRIMARY KEY (ModuleName, ProductName, VendorName)', 'FOREIGN KEY (ProductName, VendorName) REFERENCES Product(ProductName, VendorName)']);
            await this.createTable('Issues', [
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

           

          await this.insertData('Vendor', ['VendorName', 'contactInfo', 'WebsiteUrl'], [ vendor.VendorName, vendor.contactInfo, vendor.WebsiteUrl]);

         

            for(const product of vendor.Products){




            
                await this.insertData('Product', [ 'ProductName', 'VendorName', 'JSON_URL', 'release_notes'], [ product.ProductName, vendor.VendorName, product.JSON_URL!, product.release_notes]);



                for(const module of product?.modules || []){
                    await this.insertData('Module', [ 'ModuleName', 'ProductName', 'VendorName'], [ module, product.ProductName, vendor.VendorName]);
                }

                let listofversions:version_extracted[]=[]

                if(vendor.VendorName==='Fortra'){
                    listofversions=await extract_fortra_versions(product.ProductName);
                 
                }

                else{
                   
                    if(product.BASE_URL){
                        try {
                            const ids = await extract_JSON_URL(product.JSON_URL!);
                            console.log('id', ids);
                            const merged_listofversions:any[]=[]
                            
                            for(const index of ids){
                                const jsonRequest = product.BASE_URL! + index;
                                let listofversionstemp:any= await axios.get(jsonRequest);
                                listofversionstemp= extract_versions_from_json(listofversionstemp, vendor.VendorName, product.ProductName);
                                logger.info('listofversionstemp', listofversionstemp);
                                merged_listofversions.push(...listofversionstemp);
                            }
                            listofversions= merged_listofversions;
                        } catch (error) {
                           logger.error('Error fetching data:', error);
                            throw error;
                        }
                    }
                    else{
                        listofversions = await axios.get(product.JSON_URL!)
                        listofversions = extract_versions_from_json(listofversions, vendor.VendorName, product.ProductName)
                    }
            
                }
        
                let index=0;


                for(const version of listofversions){
                    
                    let UsersArray= await this.GetUsersArray(product.ProductName, vendor.VendorName, version[0]);
                    let ReleaseDate_DateTime = parseDate(version[1]!);
                    let EndOfSupportDate_DateTime = parseDate(version[2]!) 
                    let LevelOfSupport= version[3]
                    let ExtendedEndOfSupportDate= parseDate(version[4]!);
                    let EOSL_Start_Date= parseDate(version[5]!);

                    let release_notes:string|undefined;

                    if(vendor.VendorName==='OPSWAT'){
                        if(index!==0){

                            if(product.ProductName==='Metadefender_Core'){
                                release_notes = product.release_notes + '/archived-release-notes#version-v' + 
                                version[0].replace(/Version |[Vv]|\./g, '')
                                console.log('release_notes', release_notes);

                            }
                            else{
                                release_notes= product.archive_release_notes
                            }

                           
                        }
                        else{
                            release_notes= product.release_notes
                        }
                    }
                    else if(vendor.VendorName==='Fortra'){
                        release_notes= product.release_notes
                    }


                    const Version:VersionData= {
                        VersionName: version[0],
                        ProductName: product.ProductName,
                        VendorName: vendor.VendorName,
                        ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                        EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined ,
                        LevelOfSupport: LevelOfSupport? LevelOfSupport:undefined,
                        Extended_Support_End_Date: ExtendedEndOfSupportDate? ExtendedEndOfSupportDate:undefined,
                        EOSL_Start_Date: EOSL_Start_Date? EOSL_Start_Date:undefined,
                        release_notes: release_notes
                    }



                    await this.insertData('Version', 
                        [ 'VersionName', 'ProductName', 'VendorName', 'ReleaseDate', 'EndOfSupportDate', 'LevelOfSupport', 'Extended_Support_End_Date','EOSL_Start_Date','full_release_notes', 'Timestamp'], 
                        [
                            Version.VersionName, 
                            Version.ProductName!,
                            Version.VendorName!,
                            Version.ReleaseDate ? Version.ReleaseDate.toISOString() : 'NULL', 
                            Version.EndOfSupportDate ? Version.EndOfSupportDate.toISOString() : 'NULL',
                            Version.LevelOfSupport? Version.LevelOfSupport : 'NULL',
                            Version.Extended_Support_End_Date? Version.Extended_Support_End_Date.toISOString() : 'NULL',
                            Version.EOSL_Start_Date? Version.EOSL_Start_Date.toISOString() : 'NULL',
                            Version.release_notes? Version.release_notes : 'NULL',
                            new Date().toISOString()
                        ] , 
                        Version,
                        UsersArray
                    );



                   if (EndOfSupportDate_DateTime) {

                     let daysUntilExtendedEOS
                        const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if(ExtendedEndOfSupportDate){
                             daysUntilExtendedEOS= Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        }
                        if((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS <14){
                         notify_on_end_of_support(Version, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, UsersArray);
                        }
                    }
                    index++;
                }
            }
        }

  
        logger.info('Successfully completed version check');
        return true;
    }
    catch(error){

        logger.error('Error in HandleData', error);
   
        return error;
    }

        
    }

   async createTable(table?: string, columns?: string[]) {
        return new Promise((resolve, reject) => {
            try {
                let sql;
     
                    const columnsString = columns!.join(',');
                    sql = `CREATE TABLE IF NOT EXISTS ${table} (${columnsString})`;
                
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

    async insertData(table: string, columns: string[], values: string[], versionData?: VersionData, UsersArrayes?: any) {
        


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

                            //parse the EndOfSupportDate and values[3] to date   
                            const EndOfSupportDate_DateTime = parseDate(rows[0]?.EndOfSupportDate)
                            const EndOfSupportDate_DateTime_new = parseDate(values[4]);
                            this.UpdateRecord('Version', ['full_release_notes'], [values[8]], ['VersionName'], [rows[0].VersionName]);

                            if(!EndOfSupportDate_DateTime && !EndOfSupportDate_DateTime_new){
                               
                                resolve(false);
                            }
                            else if(rows[0]?.EndOfSupportDate !== values[4]){
                                this.UpdateRecord(table, ['EndOfSupportDate'], [values[4]], ['VersionName'], [rows[0].VersionName]);
                                notify_on_end_of_support_changes(rows[0].ProductName, rows[0].VendorName, rows[0].VersionName, EndOfSupportDate_DateTime? EndOfSupportDate_DateTime : undefined, EndOfSupportDate_DateTime_new? EndOfSupportDate_DateTime_new : undefined, UsersArrayes);   
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
                              
                                    notify_new_version(versionData!, UsersArrayes);
                                }
                                resolve(true);
                            }
                        }); 
                    }
                }
                });

               
             

                
                
            
            } catch(err: any) {
                logger.error('Error inserting data', err.message);
                reject(err);
            }
        });
    }

    
  
    
   async UpdateRecord(table: string, columns: string[], values: any[], whereColumn: string[], whereValue: any[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                // Create placeholders for the values
                const setClause = columns.map(col => `${col} = ?`).join(', ');
                const whereClause = whereColumn.map(col => `${col} = ?`).join(' AND ');
                const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

                // Escape special characters in values
                const sanitizedValues = values.map(value => 
                    typeof value === 'string' ? value.replace(/'/g, "''") : value
                );

                const sanitizedWhereValues = whereValue.map(value => 
                    typeof value === 'string' ? value.replace(/'/g, "''") : value
                );

                // Add the whereValue to the values array
                sanitizedValues.push(...sanitizedWhereValues);

                

                this.db.run(query, sanitizedValues, (err: Error) => {
                    if (err) {
                        logger.error('Error updating record:', err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
               
            } catch (err) {
                logger.error('Error in UpdateRecord:', err);
                reject(err);
            }
        });
    }

   async getVersions(vendor?:string, product?:string, version?:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Version ${vendor ? `WHERE VendorName='${vendor}'` : ''} ${product ? ` AND ProductName='${product}'` : ''} ${version ? ` AND VersionName='${version}'` : ''}`, (err: Error, rows: any) => {
            resolve(rows);
        });
    });
    
   }

   async getProducts(vendor?:string, product?:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Product ${vendor ? `WHERE VendorName='${vendor}'` : ''} ${product ? ` AND ProductName='${product}'` : ''}`, (err: Error, rows: any) => {
            resolve(rows);
        });
    });
   }

   async GetUsersArray(product:string, vendor:string,version:string){

    return new Promise((resolve, reject) => {
        try{
            let query= `SELECT U.Email,UC.Last_Update, UC.Unit_of_time, UC.Frequency, UC.UserID, UC.ProductName, UC.VendorName FROM User_Chosen_Products UC INNER JOIN User U ON UC.UserID=U.Id WHERE UC.ProductName='${product}' AND UC.VendorName='${vendor}'`;
        this.db.all(query, (err: Error, rows: any) => {

           if(err){

            logger.error('Error getting users array', err.message);
            reject(err);
           }

            let users_to_update= rows.map((row:any)=>{
                return {
                    Email: row.Email,
                    Last_Update: row.Last_Update,
                    Unit_of_time: row.Unit_of_time,
                    Frequency: row.Frequency,
                    UserID: row.UserID,
                    ProductName: row.ProductName,
                    VendorName: row.VendorName
                }
            });
            resolve(users_to_update);
        });
    }
    catch(err:any){
        logger.error('Error getting users array', err.message);
        reject(err);
    }
    });
   }

   async getmodules(product:string, vendor:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Module WHERE ProductName='${product}' AND VendorName='${vendor}'`, (err: Error, rows: any) => {
            resolve(rows);
        });
    });
   }

   async getissues(product:string, vendor:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM Issues WHERE ProductName='${product}' AND VendorName='${vendor}'`, (err: Error, rows: any) => {
            resolve(rows);
        });
    });
   }

   async subscribe(userid:number, product:string, vendor:string, Unit_of_time:string, Frequency:string){

    return new Promise((resolve, reject) => {
        try{
            // First check if record exists
            const checkQuery = `SELECT COUNT(*) as count FROM User_Chosen_Products 
                WHERE UserID = ? AND ProductName = ? AND VendorName = ? AND (Unit_of_time <> ? OR Frequency <> ?)`;

            // Then do the insert with proper error handling
            this.db.get(checkQuery, [userid, product, vendor, Unit_of_time, Frequency], (err: Error, row: any) => {
                if (err) {
                    logger.error('Error checking for existing subscription:', err);
                    reject({ error: 'Database error', details: err });
                    return;
                }
                
                
                if (row.count > 0) {
                    this.db.run(`UPDATE User_Chosen_Products SET Unit_of_time='${Unit_of_time}', Frequency='${Frequency}' WHERE UserID='${userid}' AND ProductName='${product}' AND VendorName='${vendor}'`, (err: Error) => {
                        if(err){
                            logger.error('Error updating subscription:', err);
                            reject({ error: 'Database error', details: err });
                        }
                        else{
                            resolve(true);
                        }
                    });
                }
                
                else{

                const insertQuery = `INSERT INTO User_Chosen_Products 
                    (UserID, ProductName, VendorName, Unit_of_time, Frequency, Last_Update) 
                    VALUES (?, ?, ?, ?, ?, ?)`;

                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    const oneYearAgoISO = oneYearAgo.toISOString();
                    
                this.db.run(insertQuery, 
                    [userid, product, vendor, Unit_of_time, Frequency, oneYearAgoISO], 
                    (err: Error) => {
                        if (err) {
                            logger.error('Error inserting subscription:', err);
                            reject({ error: 'Database error', details: err });
                            return;
                        }
                        resolve({ success: true, message: 'Subscription added' });
                    }
                );

            }
            });
        }
        catch(err:any){
            reject(false);
        }
    });
   }




   async registerUser( email:string,role?:string){


    let query='';

            query=`INSERT INTO User (Email ${role ? ',Role' : ''} ) VALUES ('${email}' ${role ? `,'${role}'` : ''})`;
            console.log(query);
        
       
        return new Promise((resolve, reject) => {

            try{
                this.db.run(query, (err: Error) => {
             
                if(err){
                    console.error('Error registering user', err.message);
                    reject(false);
                }
                else{
                    console.log('User registered successfully');
                    resolve(true);
                }
            }) 
            }
            catch(err:any){
                reject(false);
                }
        });
    }

   async checkUserSubscription( product:string, vendor:string){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM User U INNER JOIN User_Chosen_Products UC ON UC.UserID=U.Id WHERE UC.ProductName='${product}' AND UC.VendorName='${vendor}'`, (err: Error, rows: any) => {
            resolve(rows.length > 0);
        });
    });
   }

   async CheckUserExists(email:string):Promise<number> {
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM User WHERE Email='${email}'`, (err: Error, rows: any) => {
            if(rows.length > 0){
                resolve(parseInt(rows[0].Id));
            }
            else{
                resolve(0);
            }
        });
    });
   }

   async report(vendor:string, product:string, version:string, module:string, email:string, severity:string, issueDescription:string, userid:number, rule?:string) {
    return new Promise((resolve, reject) => {
        this.db.run(
            `INSERT INTO Issues (VendorName, ProductName, VersionName, ModuleName, Email, ${rule? 'Rule, ' : ''} Severity, Issue, Date_field, UserId, Ratification) 
             VALUES (?, ?, ?, ?, ?, ${rule? '?,' : ''} ?, ?, ?, ?, 1)`,
            [
                vendor, product, version, module, email, 
                ...(rule ? [rule] : []), 
                severity, issueDescription, 
                new Date().toISOString(), userid
            ],
            function(this: { lastID: number }, err: Error) {
                if(err) {
                    console.error('Error reporting issue', err.message);
                    reject(false);
                } else {
                    resolve(this.lastID);
                }
            }
        );
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

