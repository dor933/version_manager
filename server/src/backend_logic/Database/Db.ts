import axios from 'axios';
import { notify_on_end_of_support, notify_on_end_of_support_changes, notify_new_version, extract_versions_from_json,extract_fortra_versions_to_json, extract_Opswat_Key_Indexes } from '../Functions';
import { parseDate } from '../Functions';
import { DataStructure, VersionData } from '../../Types/MainDataTypes';
const Data=require('../../Data.json') as DataStructure;
import { logger } from '../index';
import { version_extracted } from '../../Types/WebTypes';
import { extract_fortra_versions } from '../Functions';
import { Sequelize } from 'sequelize';
import { User, UserChosenProduct, Vendor, Product, Version, Module, Issue } from './ORM';
import { sequelize } from './ORM';


class Database {

    sequelize: Sequelize;

    constructor() {

        this.sequelize = sequelize; 

    }

  

    async HandleData() : Promise<boolean | any> {

        let listoffortraversions= await extract_fortra_versions_to_json(Data.Vendors[1].JSON_URL!);


        try{
            await this.sequelize.sync({ force: true });

        
        for (const vendor of Data.Vendors) {

            await Vendor.findOrCreate({
                where: { vendorName: vendor.VendorName },
                defaults: {
                    contactInfo: vendor.contactInfo,
                    websiteUrl: vendor.WebsiteUrl
                }
            });

            for(const product of vendor.Products){

                await Product.findOrCreate({
                    where: { 
                        productName: product.ProductName,
                        vendorName: vendor.VendorName 
                    },
                    defaults: {
                        jsonUrl: product.JSON_URL,
                        releaseNotes: product.release_notes
                    }
                });

                

                let listofversions:version_extracted[]=[]

                if(vendor.VendorName==='Fortra'){
                    listofversions= await extract_fortra_versions(product.ProductName, listoffortraversions);
                }

                else{
                   
                    if(product.BASE_URL){
                        try {
                            const ids = await extract_Opswat_Key_Indexes(product.JSON_URL!);
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
        
                //let us know how new is the version (the smaller the index the newer the version)
                let ProductVersionIndex=0;

                for(const version of listofversions){
                    
                    let UsersArray= await this.GetUsersArray(product.ProductName, vendor.VendorName);
                    let VersionName= version[0]
                    let ReleaseDate_DateTime = parseDate(version[1]!);
                    let EndOfSupportDate_DateTime = parseDate(version[2]!) 
                    let LevelOfSupport= version[3]
                    let ExtendedEndOfSupportDate= parseDate(version[4]!);
                    let EOSL_Start_Date= parseDate(version[5]!);

                    let release_notes:string|undefined;

                    if(vendor.VendorName==='OPSWAT'){
                        if(ProductVersionIndex!==0){

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


                    const VersionData:VersionData= {
                        VersionName: VersionName,
                        ProductName: product.ProductName,
                        VendorName: vendor.VendorName,
                        ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                        EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined ,
                        LevelOfSupport: LevelOfSupport? LevelOfSupport:undefined,
                        Extended_Support_End_Date: ExtendedEndOfSupportDate? ExtendedEndOfSupportDate:undefined,
                        EOSL_Start_Date: EOSL_Start_Date? EOSL_Start_Date:undefined,
                        release_notes: release_notes
                    }

                    const [versionRecord, created] = await Version.findOrCreate({
                        where: {
                            versionName: VersionName,
                            productName: product.ProductName,
                            vendorName: vendor.VendorName
                        },
                        defaults: {
                            releaseDate: ReleaseDate_DateTime,
                            endOfSupportDate: EndOfSupportDate_DateTime,
                            levelOfSupport: LevelOfSupport,
                            extendedSupportEndDate: ExtendedEndOfSupportDate,
                            eoslStartDate: EOSL_Start_Date,
                            fullReleaseNotes: release_notes,
                            timestamp: new Date()
                        }
                    });

                    if (!created) {
                        if (versionRecord.endOfSupportDate?.getTime() !== EndOfSupportDate_DateTime?.getTime()) {
                            await versionRecord.update({
                                endOfSupportDate: EndOfSupportDate_DateTime
                            });
                            await notify_on_end_of_support_changes(
                                product.ProductName,
                                vendor.VendorName,
                                VersionName,
                                versionRecord.endOfSupportDate,
                                EndOfSupportDate_DateTime!,
                                UsersArray
                            );
                        }
                    }
                    else{
                        await notify_new_version(VersionData, UsersArray);
                    }

                   if (EndOfSupportDate_DateTime) {

                     let daysUntilExtendedEOS
                        const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if(ExtendedEndOfSupportDate){
                             daysUntilExtendedEOS= Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        }
                        if((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS <14){
                         notify_on_end_of_support(VersionData, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, UsersArray);
                        }
                    }
                    ProductVersionIndex++;
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



    
  
    
   async UpdateRecord(table: string, columns: string[], values: any[], whereColumn: string[], whereValue: any[]): Promise<boolean> {
        try {
            // Create update object from columns and values
            const updateValues = columns.reduce((obj, col, index) => {
                obj[col] = values[index];
                return obj;
            }, {} as any);

            // Create where object from whereColumn and whereValue
            const whereConditions = whereColumn.reduce((obj, col, index) => {
                obj[col] = whereValue[index];
                return obj;
            }, {} as any);

            // Get the model dynamically
            const model = sequelize.models[table];
            
            const [affectedCount] = await model.update(updateValues, {
                where: whereConditions
            });

            return affectedCount > 0;
        } catch (err) {
            logger.error('Error in UpdateRecord:', err);
            throw err;
        }
    }

    async getAll<T>(
        model: any,
        where: object = {},
        include: any[] = []
    ): Promise<T[]> {
        try {
            return await model.findAll({ where, include });
        } catch (err) {
            logger.error('Error in getAll:', err);
            throw err;
        }
    }

    async recordExists<T>(
        model: any,
        where: object
    ): Promise<T | false> {
        try {
            const record = await model.findOne({ where });
            return record ? record.id : false;
        } catch (err) {
            logger.error('Error in recordExists:', err);
            throw err;
        }
    }

    async getVersions(vendor?: string, product?: string, version?: string) {
        const where: any = {};
        if (vendor) where.vendorName = vendor;
        if (product) where.productName = product;
        if (version) where.versionName = version;
        return this.getAll<Version>(Version, where);
    }

    async getProducts(vendor?: string, product?: string) {
        return this.getAll<Product>(Product, { 
            vendorName: vendor, 
            productName: product 
        });
    }

    async getModules(product: string, vendor: string) {
        return this.getAll<Module>(Module, { 
            productName: product, 
            vendorName: vendor 
        });
    }

    async getIssues(product: string, vendor: string) {
        return this.getAll<Issue>(Issue, { 
            productName: product, 
            vendorName: vendor 
        });
    }

    async CheckUserExists(email: string): Promise<number | false> {
        let user = await this.recordExists<User>(User, { email });
        return user ? user.id : false;
    }

    async GetUsersArray(product: string, vendor: string) {
        const userProducts = await this.getAll<UserChosenProduct>(UserChosenProduct, {
            where: {
                productName: product,
                vendorName: vendor
            },
            include: [{
                model: User,
                attributes: ['email']
            }]
        });

        return userProducts.map(userProduct => ({
            Email: userProduct.User.email,
            Last_Update: userProduct.Last_Update,
            Unit_of_time: userProduct.Unit_of_time,
            Frequency: userProduct.Frequency,
            UserID: userProduct.UserID,
            ProductName: userProduct.ProductName,
            VendorName: userProduct.VendorName
        }));
    }

   async subscribe(userid:number, product:string, vendor:string, Unit_of_time:string, Frequency:string){

    return new Promise((resolve, reject) => {
        try{
         

            UserChosenProduct.count({
                where: {
                    userId: userid,
                    productName: product,
                    vendorName: vendor,
                    unitOfTime: Unit_of_time,
                    frequency: Frequency
                }
            }).then(count => {
                if (count > 0) {
                    UserChosenProduct.update(
                        {
                            unitOfTime: Unit_of_time,
                            frequency: Frequency
                        },
                        {
                            where: {
                                userId: userid,
                                productName: product,
                                vendorName: vendor
                            }
                        }
                    ).then(() => {
                        resolve(true);
                    }).catch(err => {
                        logger.error('Error updating subscription:', err);
                        reject({ error: 'Database error', details: err });
                    });
                } else {
                    UserChosenProduct.create({
                        userId: userid,
                        productName: product,
                        vendorName: vendor,
                        unitOfTime: Unit_of_time,
                        frequency: Frequency,
                        lastUpdate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                    }).then(() => {
                        resolve({ success: true, message: 'Subscription added' });
                    }).catch(err => {
                        logger.error('Error inserting subscription:', err);
                        reject({ error: 'Database error', details: err });
                    });
                }
            }).catch(err => {
                logger.error('Error checking for existing subscription:', err);
                reject({ error: 'Database error', details: err });
            });
        }
        catch(err:any){
            reject(false);
        }
    });
   }




   async registerUser( email:string,role?:string){

        
       
        return new Promise((resolve, reject) => {

            try{
                User.create({
                    email,
                    role
                }).then(() => {
                    console.log('User registered successfully');
                    resolve(true);
                }).catch(err => {
                    console.error('Error registering user', err.message);
                    reject(false);
                });
            }
            catch(err:any){
                reject(false);
                }
        });
    }

   

   async report(vendor:string, product:string, version:string, module:string, email:string, severity:string, issueDescription:string, userid:number, rule?:string) {
    return new Promise((resolve, reject) => {
        Issue.create({
            vendorName: vendor,
            productName: product,
            versionName: version,
            moduleName: module,
            email: email,
            rule: rule,
            severity: severity,
            issue: issueDescription,
            dateField: new Date().toISOString(),
            userId: userid,
            ratification: 1
        }).then(issue => {
            resolve(issue.issueId);
        }).catch(err => {
            console.error('Error reporting issue', err.message);
            reject(false);
        });
    });
}

    

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sequelize.close().then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
}





export {  Database };

