
import { NotifyOnEndOfSupport, NotifyOnEndOfSupportChanges, NotifyNewVersion, ExtractVersionsFromJson,ExtractFortraVersionsToJson, ExtractOpswatKeyIndexes, ExtractFortraVersions } from '../Functions/LogicFunctions';
import { ParseDate } from '../Functions/LogicFunctions';
import { DataStructure, VersionData } from '../../Types/MainDataTypes';
const Data=require('../../../Data.json') as DataStructure;
import { logger } from '../index';
import { VersionExtracted } from '../../Types/WebTypes';
import { Model, Sequelize } from 'sequelize';
import { User, UserChosenProduct, Vendor, Product, Version, Module, Issue } from './ORM';
import { sequelize } from './ORM';
import axios from 'axios';


 class Database {

    sequelize: Sequelize;

    constructor() {

        this.sequelize = sequelize; 

    }

  

    async HandleData() : Promise<boolean | unknown> {

        let listoffortraversions= await ExtractFortraVersionsToJson(Data.Vendors[1].JSON_URL!);

        try{

      
        //vendor processing
        for (const vendor of Data.Vendors) {

            await Vendor.findOrCreate({
                where: { VendorName : vendor.VendorName },
                defaults: {
                    ContactInfo: vendor.contactInfo,
                    WebsiteUrl: vendor.WebsiteUrl
                }
            });

            //product processing
            for(const product of vendor.Products){

             let productRecord=await Product.findOrCreate({
                    where: { 
                        ProductName: product.ProductName,
                        //Because we want to save consistenty when we re-initialize the database, we need to search the VendorId by vendor name
                        VendorId: (await Vendor.findOne({ where: { VendorName: vendor.VendorName } }))?.VendorId 
                    },
                    defaults: {
                        JSON_URL: product.JSON_URL,
                        ReleaseNotes: product.release_notes
                    }
                });

                if(product.modules){
                    for(const module of product.modules){
                        await Module.findOrCreate({
                            //Because we want to save consistenty when we re-initialize the database, we need to search the VendorId by vendor name
                            where: {ModuleName: module, ProductId: productRecord[0].ProductId, VendorId: (await Vendor.findOne({ where: { VendorName: vendor.VendorName} }))?.VendorId },
                            defaults: { ModuleName: module }
                        });
                    }
                }

                
                //versions extraction
                let listofversions:VersionExtracted[]=[]

                if(vendor.VendorName==='Fortra'){
                    listofversions= await ExtractFortraVersions(product.ProductName, listoffortraversions);
                }

                else{
                   
                    if(product.BASE_URL){
                        try {
                            const ids = await ExtractOpswatKeyIndexes(product.JSON_URL!);
                            const merged_listofversions:any[]=[]
                            
                            for(const index of ids){
                                const jsonRequest = product.BASE_URL! + index;
                                let listofversionstemp:any= await axios.get(jsonRequest);
                                listofversionstemp= ExtractVersionsFromJson(listofversionstemp, vendor.VendorName, product.ProductName);
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
                        listofversions = ExtractVersionsFromJson(listofversions, vendor.VendorName, product.ProductName)
                    }
            
                }
        
                //let us know how new is the version (the smaller the index the newer the version)
                let ProductVersionIndex=0;

                //version processing
                for(const version of listofversions){
                    
                    let UsersArray= await this.GetUsersArray(product.ProductName, vendor.VendorName);
                    let VersionNameExtracted= version[0]
                    if (!VersionNameExtracted) {
                        logger.warn(`Skipping version with undefined name for product ${product.ProductName}`);
                        continue; // Skip this version and continue with the next one
                    }
                    let ReleaseDate_DateTime = ParseDate(version[1]!);
                    let EndOfSupportDate_DateTime = ParseDate(version[2]!) 
                    let LevelOfSupport= version[3]
                    let ExtendedEndOfSupportDate= ParseDate(version[4]!);
                    let EOSL_Start_Date= ParseDate(version[5]!);

                    let release_notes:string|undefined;

                    if(vendor.VendorName==='OPSWAT'){
                        if(ProductVersionIndex!==0){

                            if(product.ProductName==='Metadefender_Core'){
                                release_notes = product.release_notes + '/archived-release-notes#version-v' + 
                                VersionNameExtracted.replace(/Version |[Vv]|\./g, '')

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
                        VersionName: VersionNameExtracted,
                        ProductName: product.ProductName,
                        VendorName: vendor.VendorName,
                        ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                        EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined ,
                        LevelOfSupport: LevelOfSupport? LevelOfSupport:undefined,
                        ExtendedSupportEndDate: ExtendedEndOfSupportDate? ExtendedEndOfSupportDate:undefined,
                        EoslStartDate: EOSL_Start_Date? EOSL_Start_Date:undefined,
                        FullReleaseNotes: release_notes
                    }


                    const [versionRecord, created] = await Version.findOrCreate({
                        where: {
                            VersionName: VersionData.VersionName,
                            //since product id defined in database and we want to let the db re-initialize the product if it is not found, we need to search it by product name and vendor id
                            ProductId: (await Product.findOne({ 
                                where: { 
                                    ProductName: VersionData.ProductName, 
                                    VendorId: vendor.VendorId 
                                } 
                            }))?.ProductId,
                            //since vendor id defined in database and we want to let the db re-initialize the vendor if it is not found, we need to search it by vendor name
                            VendorId: (await Vendor.findOne({ 
                                where: { 
                                    VendorName: vendor.VendorName 
                                } 
                            }))?.VendorId
                        },
                        include: [{
                            model: Product,
                            attributes: ['ProductId'],
                            where: {
                                ProductName: VersionData.ProductName,
                            }
                        }  ,
                        {
                            model: Vendor,
                            attributes: ['VendorId'],
                            where: {
                                VendorName: vendor.VendorName
                            }
                        }
                    ],
                        defaults: {
                            //as mentioned before, we need to let the db re-initialize the product if it is not found, so we need to search it by product name and vendor id
                            ProductId: (await Product.findOne({ 
                                where: { 
                                    ProductName: VersionData.ProductName, 
                                    VendorId: vendor.VendorId 
                                } 
                            }))?.ProductId || null,
                            //as mentioned before, we need to let the db re-initialize the vendor if it is not found, so we need to search it by vendor name
                            VendorId: (await Vendor.findOne({ 
                                where: { 
                                    VendorName: vendor.VendorName 
                                } 
                            }))?.VendorId || null,
                            ReleaseDate: VersionData.ReleaseDate,
                            EndOfSupportDate: VersionData.EndOfSupportDate,
                            LevelOfSupport: VersionData.LevelOfSupport,
                            ExtendedSupportEndDate: VersionData.ExtendedSupportEndDate,
                            EoslStartDate: VersionData.EoslStartDate,
                            FullReleaseNotes: VersionData.FullReleaseNotes,
                            Timestamp: new Date()
                        }
                    });

                    if (!created) {
                        if (versionRecord.EndOfSupportDate?.getTime() !== EndOfSupportDate_DateTime?.getTime()) {
                            await versionRecord.update({
                                EndOfSupportDate: EndOfSupportDate_DateTime
                            });
                            await NotifyOnEndOfSupportChanges(
                                product.ProductName,
                                vendor.VendorName,
                                VersionData.VersionName,
                                versionRecord.EndOfSupportDate,
                                EndOfSupportDate_DateTime!,
                                UsersArray
                            );
                        }
                    }
                    else{
                        await NotifyNewVersion(VersionData, UsersArray);
                    }

                   if (EndOfSupportDate_DateTime) {

                     let daysUntilExtendedEOS
                        const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if(ExtendedEndOfSupportDate){
                             daysUntilExtendedEOS= Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        }
                        if((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS <14){
                         NotifyOnEndOfSupport(VersionData, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, UsersArray);
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

        logger.error('Error in handleData', error);
   
        return error;
    }

        
    }


    
   async UpdateRecord(table: string, columns: string[], values: any[], whereColumn: string[], whereValue: any[]): Promise<any> {
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
            
            //get back the record that was updated
            const [affectedCount] = await model.update(updateValues, {
                where: whereConditions
            });


            if (affectedCount === 0) {
                return false;
            }
            else{
                const updatedRecord = await model.findOne({ where: whereConditions });
                return updatedRecord;
            }
        } catch (err) {
            logger.error('Error in UpdateRecord:', err);
            throw err;
        }
    }

    async getAll<T>(
        model: typeof Model & { findAll: (options: any) => Promise<T[]> },
        where: object = {},
        include: any[] = []
    ): Promise<T[]> {
        try {
            // Filter out undefined values from where clause
            const filteredWhere = Object.entries(where).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            const options: any = {
                include
            };

            // Only add where clause if there are conditions
            if (Object.keys(filteredWhere).length > 0) {
                options.where = filteredWhere;
            }

            return await model.findAll(options);
        } catch (err) {
            logger.error('Error in getAll:', err);
            throw err;
        }
    }

    async RecordExists<T>(
        model: typeof Model & { findOne: (options: any) => Promise<T> },
        where: object
    ): Promise<T | false> {
        try {
            const record = await model.findOne({ where });
            return record ? record : false;
        } catch (err) {
            logger.error('Error in recordExists:', err);
            throw err;
        }
    }

    async getVersions(vendor?: string, product?: string) {
        try{
        const where: any = {};
        let VendorId = vendor? await Vendor.findOne({ where: { VendorName: vendor } }) : null;
        let ProductId = product? await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } }) : null;
        
        if (vendor) where.VendorId = VendorId?.VendorId;
        if (product) where.ProductId = ProductId?.ProductId;


        let versions= await this.getAll<Version>(Version, where, [
            {
                model: Product,
                attributes: ['ProductName']
            },
            {
                model: Vendor,
                attributes: ['VendorName']
            }
        ]);

        let versionsdata= versions.map((version:any)=>{
          
            return {
                VersionId: version.VersionId,

                VersionName: version.VersionName,
                ProductName: version.Product.ProductName,
                VendorName: version.Vendor.VendorName,
                ReleaseDate: version.ReleaseDate? version.ReleaseDate:undefined,
                EndOfSupportDate: version.EndOfSupportDate? version.EndOfSupportDate:undefined,
                LevelOfSupport: version.LevelOfSupport? version.LevelOfSupport:undefined,
                ExtendedSupportEndDate: version.ExtendedSupportEndDate? version.ExtendedSupportEndDate:undefined,
                EoslStartDate: version.EoslStartDate? version.EoslStartDate:undefined,
                FullReleaseNotes: version.FullReleaseNotes? version.FullReleaseNotes:undefined,
                Timestamp: version.Timestamp? version.Timestamp:undefined
      
            }
        })

        return versionsdata;
    }
    catch(error){
        logger.error('Error in getVersions', error);
        throw error;
    }
    }

    async getProducts(vendor?: string) {
        try{
        const where: any = {};
        let VendorId= vendor? await Vendor.findOne({ where: { VendorName: vendor } }) : null;
    
        if (vendor) where.VendorId = VendorId?.VendorId;
        let products= await this.getAll<Product>(Product, where, [{
            model: Vendor,
            attributes: ['VendorName', 'VendorId']
        }]);

        let productsdata= products.map((product:any)=>{
            return {
                ProductName: product.ProductName,
                VendorName: product.Vendor.VendorName,
                ProductId: product.ProductId,
                VendorId: product.VendorId,
                JSON_URL: product.JSON_URL,
                ReleaseNotes: product.ReleaseNotes? product.ReleaseNotes:undefined,
            }
        })
        return productsdata;
    }
    catch(error){
        logger.error('Error in getProducts', error);
        throw error;
    }
    }


    async getModules(product: string, vendor: string) {
        try{
        let VendorId= await Vendor.findOne({ where: { VendorName: vendor } });
        let ProductId= await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } });
        let modules= await this.getAll<Module>(Module, { 
            ProductId: ProductId?.ProductId,
            VendorId: VendorId?.VendorId
        }, [
            {
                model: Vendor,
                attributes: ['VendorName', 'VendorId']
            },
            {
                model: Product,
                attributes: ['ProductName', 'ProductId']
            }
        ]);

        let modulesdata= modules.map((module:any)=>{
            return {
                ModuleName: module.ModuleName,
                ProductName: module.Product.ProductName,
                VendorName: module.Vendor.VendorName
            }
        })
        return modulesdata;
    }
    catch(error){
        logger.error('Error in getModules', error);
        throw error;
    }
    }


    async getIssues(product: string, vendor: string) {
        try{
        let VendorId= await Vendor.findOne({ where: { VendorName: vendor } });
        let ProductId= await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } });
        let issues= await this.getAll<Issue>(Issue, { 
            ProductId: ProductId?.ProductId,
            VendorId: VendorId?.VendorId
        }, [
            {
                model: Product,
                attributes: ['ProductName', 'ProductId']
            },
            {
                model: Vendor,
                attributes: ['VendorName']
            },
            {
                model: Version,
                attributes: ['VersionName', 'VersionId']
            }
        ]);

        let issuesdata= issues.map((issue:any)=>{
            return {
                Issue: issue.Issue,
                IssueId: issue.IssueId,
                VersionId: issue.VersionId,
                ModuleId: issue.ModuleId,
                VersionName: issue.Version.VersionName,
                Email: issue.Email,
                Rule: issue.Rule ? issue.Rule : undefined,
                Severity: issue.Severity ? issue.Severity : undefined,
                DateField: issue.DateField,
                UserID: issue.UserID,
                Ratification: issue.Ratification,
                Workaround: issue.Workaround ? issue.Workaround : undefined,
                Resolution: issue.Resolution ? issue.Resolution : undefined
            }
        
    

        })
        return issuesdata;
    }
    catch(error){
        logger.error('Error in getIssues', error);
        throw error;
    }
        }

    async CheckUserExists(email: string): Promise<number | false> {
        let user = await this.RecordExists<User>(User, { email });
        return user ? user.id : false;
    }

    async GetUsersArray(product: string, vendor: string) {
        let VendorId= await Vendor.findOne({ where: { VendorName: vendor } });
        let ProductId= await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } });
        const userProducts = await this.getAll<UserChosenProduct>(UserChosenProduct, {
            ProductId: ProductId?.ProductId,
            VendorId: VendorId?.VendorId
        }, [{
            model: User,
            attributes: ['email']
        }]);

        return userProducts.map(userProduct => ({
            Email: userProduct.User.email,
            LastUpdate: userProduct.LastUpdate,
            UnitOfTime: userProduct.UnitOfTime,
            Frequency: userProduct.Frequency,
            UserID: userProduct.UserID,
            ProductId: userProduct.ProductId,
            VendorId: userProduct.VendorId
        }));
    }

   async subscribe(userid: number, product: string, vendor: string, Unit_of_time: string, Frequency: string) {

    const VendorId= await Vendor.findOne({ where: { VendorName: vendor } });
    const ProductId= await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } });

    return new Promise((resolve, reject) => {

        try {
            UserChosenProduct.count({
                where: {
                    UserID: userid,
                    ProductId: ProductId?.ProductId,
                   
                }
            }).then(count => {
                if (count > 0) {
                    UserChosenProduct.update(
                        {
                            UnitOfTime: Unit_of_time,
                            Frequency: Frequency
                        },
                        {
                            where: {
                                UserID: userid,
                                ProductId: ProductId?.ProductId,
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
                        UserID: userid,
                        ProductId: ProductId?.ProductId,
                        VendorId: VendorId?.VendorId,
                        UnitOfTime: Unit_of_time,
                        Frequency: Frequency,
                        LastUpdate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
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
        } catch (err: any) {
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
                    logger.info('User registered successfully- '+email);
                    resolve(true);
                }).catch(err => {
                    logger.error('Error registering user- '+email, err.message);
                    reject(false);
                });
            }
            catch(err:any){
                reject(false);
                }
        });
    }

   

   async report(vendor:string, product:string, version:string, module:string, email:string, severity:string, issueDescription:string, userid:number, rule?:string) {

    let VendorId= await Vendor.findOne({ where: { VendorName: vendor } });
    let ProductId= await Product.findOne({ where: { ProductName: product, VendorId: VendorId?.VendorId } });
    let VersionId= await Version.findOne({ where: { VersionName: version, ProductId: ProductId?.ProductId } });
    let ModuleId= await Module.findOne({ where: { ModuleName: module, ProductId: ProductId?.ProductId, VendorId: VendorId?.VendorId } });

    return new Promise((resolve, reject) => {
        Issue.create({
            VendorId: VendorId?.VendorId,
            ProductId: ProductId?.ProductId,
            VersionId: VersionId?.VersionId,
            ModuleId: ModuleId?.ModuleId,
            Email: email,
            Rule: rule,
            Severity: severity,
            Issue: issueDescription,
            DateField: new Date().toISOString(),
            UserID: userid,
            Ratification: 1
        }).then(issue => {  
            resolve(issue.IssueId);
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

export default Database;



