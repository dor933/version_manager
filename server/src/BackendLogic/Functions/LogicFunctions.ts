import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { VersionData } from '../../Types/MainDataTypes';
import { createEmailTemplate } from '../EmailTemplate';
import { VersionExtracted } from '../../Types/WebTypes';
import { isinit, logger } from '../index';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../index';
import { EmailBodyCreator, FortraVersionObjectCreator, GetMilliseconds, isType1Product } from './HelperFunctions';
import { UserChosenProduct } from '../Database/Schemes';

let identifier=0;

function ParseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Try parsing various date formats
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
        // Create new date using UTC values to preserve timezone
        return new Date(Date.UTC(
            parsedDate.getUTCFullYear(),
            parsedDate.getUTCMonth(),
            parsedDate.getUTCDate(),
            parsedDate.getUTCHours(),
            parsedDate.getUTCMinutes(),
            parsedDate.getUTCSeconds()
        ));
    }

    // Try parsing "September 6, 2023" format
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const parts = dateStr.toLowerCase().match(/(\w+)\s+(\d+),?\s+(\d{4})/);
    if (parts) {
        const month = monthNames.indexOf(parts[1]);
        if (month !== -1) {
            // Use UTC for this format as well
            return new Date(Date.UTC(parseInt(parts[3]), month, parseInt(parts[2])));
        }
    }

    // Try parsing "06 Oct 2022" format
    const shortParts = dateStr.match(/(\d{2})\s+(\w{3})\s+(\d{4})/);
    if (shortParts) {
        const tempDate = new Date(`${shortParts[2]} ${shortParts[1]} ${shortParts[3]}`);
        // Use UTC for this format as well
        return new Date(Date.UTC(
            tempDate.getUTCFullYear(),
            tempDate.getUTCMonth(),
            tempDate.getUTCDate()
        ));
    }

    return null;
}

async function getproductsandmodules(products:any){

    let productsandmodules:any= [];

for(let product of products){
    let modules= await db.getModules(product.ProductName, product.VendorName);
 
    let issues= await db.getIssues(product.ProductName, product.VendorName);
  
    productsandmodules.push({ProductName: product.ProductName, modules: modules, issues: issues});
   }

   return productsandmodules;
}

async function NotifyOnEndOfSupport(versionData: VersionData, daysUntilEOS: number, daysUntilExtendedEOS?:number, users_array?: any) {
    // This function is now just a placeholder since EOL notification processing 
    // is fully handled by the Database.processEolNotifications method
    // We keep this function to maintain compatibility with existing code
    logger.info(`EOL notification for ${versionData.ProductName} ${versionData.VersionName} will be handled in batch processing`);
    return;
}

// This function is now redundant since the batch processing is handled
// by the Database.processEolNotifications method
async function SendEosNotifications({ 
    versionData,
    emailBody, 
    users_array 
}: { 
    versionData: VersionData,
    emailBody: any, 
    users_array?: any
}) {
    // Just log that we received this call but processing happens in batch
    logger.info(`EOL notification for ${versionData.ProductName} ${versionData.VersionName} will be handled in batch processing`);
    return;
}

async function ExtractFortraVersions(productname:string,listoffortraversions:any):Promise<VersionExtracted[]>{

    let fortra_version_extracted:VersionExtracted[]=[]
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
    


async function ExtractFortraVersionsToJson(json_url:string):Promise<any> {

    let listofVersions:any= await axios.get(json_url)
    listofVersions= listofVersions.data.content;
    //extract from the html the <td> tags with cheerio

   
    try{
        const $= cheerio.load(listofVersions);
        let listoftd= $('td');
        

    let listofVersions_ret:any={

        Goanywhere_MFT:[] as VersionExtracted[],
        Goanywhere_Gateway:[] as VersionExtracted[],
        Goanywhere_Agent:[] as VersionExtracted[],
    }


    for(let i=0; i<listoftd.length; i+=7){


        let VersionObject:any;

        switch(cheerio.load(listofVersions)(listoftd[i]).text().toLowerCase()){
            case 'mft':
            
             VersionObject= FortraVersionObjectCreator(cheerio.load(listofVersions)(listoftd[i+1]).text(), cheerio.load(listofVersions)(listoftd[i+3]).text(), cheerio.load(listofVersions)(listoftd[i+6]).text(), cheerio.load(listofVersions)(listoftd[i+2]).text(), cheerio.load(listofVersions)(listoftd[i+5]).text(), cheerio.load(listofVersions)(listoftd[i+4]).text())

                listofVersions_ret.Goanywhere_MFT.push(VersionObject);
                break;
               
             
               
            case 'gateway':
                VersionObject= FortraVersionObjectCreator(cheerio.load(listofVersions)(listoftd[i+1]).text(), cheerio.load(listofVersions)(listoftd[i+3]).text(), cheerio.load(listofVersions)(listoftd[i+6]).text(), cheerio.load(listofVersions)(listoftd[i+2]).text(), cheerio.load(listofVersions)(listoftd[i+5]).text(), cheerio.load(listofVersions)(listoftd[i+4]).text())
                listofVersions_ret.Goanywhere_Gateway.push(VersionObject);

                break;
            case 'agents':
                VersionObject= FortraVersionObjectCreator(cheerio.load(listofVersions)(listoftd[i+1]).text(), cheerio.load(listofVersions)(listoftd[i+3]).text(), cheerio.load(listofVersions)(listoftd[i+6]).text(), cheerio.load(listofVersions)(listoftd[i+2]).text(), cheerio.load(listofVersions)(listoftd[i+5]).text(), cheerio.load(listofVersions)(listoftd[i+4]).text())
                listofVersions_ret.Goanywhere_Agent.push(VersionObject);

                break;
        }
    }
    return listofVersions_ret;
}
    catch(error){
        logger.error('error extracting fortra versions to json', error);
        return []
    }

}

async function NotifyOnEndOfSupportChanges(product: string, vendor: string, version: string, oldDate?: Date, newDate?: Date, users_array?: any) {


    const emailBody = EmailBodyCreator('Team', `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`, `Hey Team`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} has been changed.`, `Changes Detected:`, `End of Support Date changed from `, `${oldDate ? oldDate.toDateString() : 'No old date'}`, `to`, `${newDate ? newDate.toDateString() : 'No new date'}`)
        
  
        try{

        await SendEmail({
            subject: `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`,
            content: emailBody,
            vendor_name: vendor,
            users_array: users_array
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
    }
    
}


async function ExtractOpswatKeyIndexes(url:string){

    try {

        let elementfound=false;
        let i=1;


    const object= await axios.get(url);
 
    //get the last element in the array in the object that called "publicVersions"
    const publicVersions= object.data.publicVersions;

    const lengthpublicVersions= publicVersions.length;
    const arrayofpages:any[]=[];


    //only objects with publicIndxes are relevant- if not found, increment i
    while(!elementfound){

    let relevant_obj= publicVersions[lengthpublicVersions-i]
 
    relevant_obj= relevant_obj.publicDocumentations.find((element:any)=> element.slug.includes('knowledgebase') || element.slug.includes('knowledge-base'));
   

     if(relevant_obj?.publicIndxes){
    const objwithpageonly= relevant_obj.publicIndxes;
 

    for(let i=0; i<objwithpageonly.length; i++){
      
        if(objwithpageonly[i].page!==undefined){
            const regex= /how-long-is-the-support-lifecycle-for-a-specific-version-of-|how-long-is-the-support-life-cycle-for-a-/;
            if(objwithpageonly[i].page?.slug.match(regex)){

               
                identifier++;

                               
                arrayofpages.push(objwithpageonly[i].page);
            }
            
        }
    }
    elementfound=true;
}
    else{
        i++
    }
}

    const concated_indexes:string[]= arrayofpages.map((element:any)=> element.id);
    return concated_indexes;


}
catch(error){
    logger.error('Error extracting JSON URL: ' + url, { error });
    return []
}

}



function ExtractVersionsFromJson(response_json: any, manufacturer: string, productName: string): VersionExtracted[]  {

    let version_extracted_ret: VersionExtracted[] = []

    if(manufacturer === 'OPSWAT'){

        if(isType1Product(productName)){
        

    let listofVersions = response_json.data.plugins;

    try{

    for(const version of listofVersions){
        
        if(version.data.contents!== undefined){

            version_extracted_ret = version.data.contents;


        }
    }

    version_extracted_ret = version_extracted_ret.filter((version:any)=>!version[0].includes('Release number')  && !version[0].includes('Release Number'));

    return version_extracted_ret;
}
catch(error){
    logger.error('Error extracting versions from JSON when processing Type1 product:', { error });
    return version_extracted_ret
}
                                 
}
    else{

        try{

        let listofVersions = response_json.data.publicVersions;
        let listtoreturn:VersionExtracted[]=[];
        let i=0;

        for(const version of listofVersions){

            
            let version_name=version.name;        
            let versobject:VersionExtracted=[version_name,null,null];
            
            listtoreturn.push(versobject);

            
        

        }

        return listtoreturn;

        }
        catch(error){
            logger.error('Error extracting versions from JSON when processing Type2 product:', { error });
            return version_extracted_ret;
        }
    }

}

else if(manufacturer === 'FORTRA'){

    //here will be the code for FORTRA
    return response_json;
}

return version_extracted_ret;



}


async function NotifyNewVersion(newVersion: VersionData, users_array?: any) {
    
    // Compare relevant fields
    
    
        const emailBody = EmailBodyCreator('Team', `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`, `Hey Team`, `A new version has been detected for ${newVersion.ProductName.replace(/_/g, ' ')}`, `Version:`, ``, `${newVersion.VersionName}`, `Release Date:`, `${newVersion.ReleaseDate? newVersion.ReleaseDate.toDateString() : 'No release date'}`)
       

        try{

        await SendEmail({
            subject: `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`,
            content: emailBody,
            vendor_name: newVersion.VendorName,
            users_array: users_array
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
    }
    
}

async function createEolVersionToNotify(versionInfo:any, UsersArray:any, daysUntilEOS:number, daysUntilExtendedEOS:number, eolVersionsToNotify:any){
    const usersByFrequency: { [key: string]: any[] } = {};
                  
    for (const user of UsersArray) {
      const frequencyKey = `${user.UnitOfTime}_${user.Frequency}`;
      if (!usersByFrequency[frequencyKey]) {
        usersByFrequency[frequencyKey] = [];
      }
      usersByFrequency[frequencyKey].push(user);
    }
    
    // Store the version for notification with each frequency group
    for (const frequencyKey in usersByFrequency) {
      eolVersionsToNotify.push({
        versionData: versionInfo,
        daysUntilEOS,
        daysUntilExtendedEOS: daysUntilExtendedEOS,
        users: usersByFrequency[frequencyKey],
        frequency: frequencyKey
      });
    }
}

async function sendEosEmail(users:any, frequency:string, emailBody:any, versionInfo:any,) {

    const uniqueEmails = [...new Set(users.map((user:any) => user.Email))];
          
    // Send emails to each unique user
    for (const email of uniqueEmails) {
      const userProducts = users.filter((u:any) => u.Email === email);
        
      // Check if we should send a notification based on LastUpdate
      let shouldSendEmail = false;
      let earliestUpdate = new Date().getTime();
        
      for (const product of userProducts) {
        const lastUpdateMs = new Date(product.LastUpdate).getTime();
        if (lastUpdateMs < earliestUpdate) {
          earliestUpdate = lastUpdateMs;
        }
      }
        
      const frequencyParts = frequency.split('_');
      const unitOfTime = frequencyParts[0];
      const frequencyValue = parseInt(frequencyParts[1]);
        
      const frequencyMs = GetMilliseconds(unitOfTime);
      const totalOffset = frequencyValue * frequencyMs;
      const nextUpdateTime = earliestUpdate + totalOffset;
        
      shouldSendEmail = nextUpdateTime < new Date().getTime();
        
      if (shouldSendEmail) {
        try {
          const transporter = nodemailer.createTransport({
            host: "mail.bulwarx.local",
            port: 25,
            secure: false,
            tls: {
              ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3',
              rejectUnauthorized: false
            }
          });
            
          await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email as string,
            subject: `End of Support Alert: ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName}`,
            html: createEmailTemplate(emailBody, versionInfo.versionData.VendorName)
          });
            
          logger.info('EOL notification sent:', { 
            email, 
            version: versionInfo.versionData.VersionName, 
            product: versionInfo.versionData.ProductName,
            frequency: frequency,
            nextUpdateTime: new Date(nextUpdateTime).toISOString(),
            currentTime: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Error sending EOL email:', { error, email });
        }
      }
      else{
        logger.info('No email sent (last update is not old enough):', { 
          email, 
          version: versionInfo.versionData.VersionName, 
          product: versionInfo.versionData.ProductName,
          frequency: frequency,
          nextUpdateTime: new Date(nextUpdateTime).toISOString(),
          currentTime: new Date().toISOString()
        });
      }
    }
  }

  async function UpdateLastUpdate( frequency:string){
    const currentDate = new Date().toISOString();
    const frequencyParts = frequency.split('_');
    const unitOfTime = frequencyParts[0];
    const frequencyValue = frequencyParts[1];
    
    // Get all products with this frequency setting
    const allProductsWithFrequency = await UserChosenProduct.findAll({
      where: {
        UnitOfTime: unitOfTime,
        Frequency: frequencyValue
      }
    });
    
    // Update LastUpdate for all these products
    for (const product of allProductsWithFrequency) {
      await product.update({
        LastUpdate: currentDate
      });
    }
    
    logger.info('Updated LastUpdate for all products with frequency:', { 
      frequency, 
      productsCount: allProductsWithFrequency.length 
    });
    
}
    

async function SendEmail({ 
    subject, 
    content, 
    vendor_name, 
    users_array 
  }: { 
    subject: string, 
    content: any, 
    vendor_name: string, 
    users_array?: any
  }) {

    // Early return if no users or initialization
    if (users_array === undefined || users_array === '' || isinit === true) {
      return;
    }
  
    // Skip end of support notifications as they're handled by SendEosNotifications
    if (subject.includes('End of Support Alert:') || subject.includes('Critical: End of Support Approaching')) {
      return;
    }
  
    const transporter = nodemailer.createTransport({
      host: "mail.bulwarx.local",
      port: 25,
      secure: false,
      tls: {
        ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3',
        rejectUnauthorized: false
      }
    });
  
    try {
      if (users_array && users_array.length > 0) {
        for (const mailbox of users_array) {
   
          // Calculate each part separately for better debugging
          const lastUpdateMs = new Date(mailbox.LastUpdate).getTime();
          console.log('Last Update in ms:', lastUpdateMs);
  
          const frequencyMs = GetMilliseconds(mailbox.UnitOfTime);
          const totalOffset = mailbox.Frequency * frequencyMs;
          console.log('Total time offset:', totalOffset);
  
          const nextUpdateTime = lastUpdateMs + totalOffset;

          const shouldSendEmail = 
            subject.includes('End of Support Date Change:') || 
            subject.includes('Version Changes Detected:') || 
            nextUpdateTime < new Date().getTime();
  
          if (shouldSendEmail) {
             await transporter.sendMail({
              from: process.env.USER_EMAIL,
              to: mailbox.Email,
              subject: subject,
              html: createEmailTemplate(content, vendor_name)
            });
  
            // Update the last_update field in the database
          let affectedCount=  await db.UpdateRecord(
              'UserChosenProduct',
              ['LastUpdate'],
              [new Date().toISOString()],
              ['UserID', 'ProductId', 'VendorId'],
              [mailbox.UserID, mailbox.ProductId, mailbox.VendorId]
            );

            if(affectedCount)
                logger.info('Email sent and last_update updated:', {  mailbox });
            else
                logger.error('Error updating last_update in database:', { mailbox });
          } else {
            logger.info('Email not sent (last update is not old enough):', { mailbox });
          }
        }
      } else {
        logger.info('No users to send email to');
      }
    } catch (error) {
      logger.error('Error sending email:', { error });
      throw error;
    }
  }
  
 



export { NotifyOnEndOfSupport, NotifyNewVersion, SendEmail, ParseDate, NotifyOnEndOfSupportChanges, ExtractVersionsFromJson, ExtractFortraVersionsToJson, ExtractOpswatKeyIndexes, ExtractFortraVersions, getproductsandmodules, SendEosNotifications, sendEosEmail, UpdateLastUpdate, createEolVersionToNotify };
