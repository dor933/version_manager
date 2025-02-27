import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { VersionData } from '../../Types/MainDataTypes';
import { createEmailTemplate } from '../emailTemplate';
import { version_extracted } from '../../Types/WebTypes';
import { isinit, logger } from '../index';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../index';
import { EmailBodyCreator, FortraVersionObjectCreator, getMilliseconds, isType1Product } from './HelperFunctions';

let identifier=0;

function parseDate(dateStr: string): Date | null {
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

async function notify_on_end_of_support(versionData: VersionData , daysUntilEOS: number, daysUntilExtendedEOS?:number, users_array?: any) {
    const product = versionData.ProductName;
    const version = versionData.VersionName;
    
    // Calculate days until end of support

    let emailBody = {}

    if(daysUntilExtendedEOS){

        emailBody = EmailBodyCreator('Team', `End of Extended Support Alert: ${product.replace(/_/g, ' ')} ${version}`, `Hey Team`, `The end of extended support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`, `End of Support Date:`, `The end of extended support date for ${product.replace(/_/g, ' ')} ${version} is:`, `${versionData.ExtendedSupportEndDate?.toDateString()} ,`, `Number of days remaining:`, `${daysUntilEOS}`)

    }

    else{
    
    if (daysUntilEOS <= 7) { // Notify when 30 days or less remaining

        emailBody = EmailBodyCreator('Team', `Critical: End of Support Approaching - 7 days or less remaining`, `Hey Team`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`, `End of Support Date:`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} is:`, `${versionData.EndOfSupportDate?.toDateString()} ,`, `Number of days remaining:`, `${daysUntilEOS}`)
   
    
    }
    else if (daysUntilEOS <= 30) {

        emailBody = EmailBodyCreator('Team', `End of Support Alert: ${product.replace(/_/g, ' ')} ${version}`, `Hey Team`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`, `End of Support Date:`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} is:`, `${versionData.EndOfSupportDate?.toDateString()} ,`, `Number of days remaining:`, `${daysUntilEOS}`)

  
    }
}
    

    try{

    await sendEmail({
        subject: `End of Support Alert: ${product} ${version}`,
        content: emailBody,
        vendor_name: versionData.VendorName,
        users_array: users_array
    });
}
catch(error){
    logger.error('Error sending email:', { error });
}

}

async function extract_fortra_versions(productname:string,listoffortraversions:any):Promise<version_extracted[]>{

    
    
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
    


async function extract_fortra_versions_to_json(json_url:string):Promise<any> {

    let listofVersions:any= await axios.get(json_url)
    listofVersions= listofVersions.data.content;
    //extract from the html the <td> tags with cheerio

   
    try{
        const $= cheerio.load(listofVersions);
        let listoftd= $('td');
        

    let listofVersions_ret:any={

        Goanywhere_MFT:[] as version_extracted[],
        Goanywhere_Gateway:[] as version_extracted[],
        Goanywhere_Agent:[] as version_extracted[],
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

async function notify_on_end_of_support_changes(product: string, vendor: string, version: string, oldDate?: Date, newDate?: Date, users_array?: any) {



    const emailBody = EmailBodyCreator('Team', `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`, `Hey Team`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} has been changed.`, `Changes Detected:`, `End of Support Date changed from `, `${oldDate ? oldDate.toDateString() : 'No old date'}`, `to`, `${newDate ? newDate.toDateString() : 'No new date'}`)
        
  
        try{

        await sendEmail({
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


async function extract_Opswat_Key_Indexes(url:string){

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



function extract_versions_from_json(response_json: any, manufacturer: string, productName: string): version_extracted[]  {


    let version_extracted_ret: version_extracted[] = []

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
        let listtoreturn:version_extracted[]=[];
        let i=0;


        for(const version of listofVersions){

            
            let version_name=version.name;        
            let versobject:version_extracted=[version_name,null,null];
            
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


async function notify_new_version(newVersion: VersionData, users_array?: any) {
    
    // Compare relevant fields
    
    
        const emailBody = EmailBodyCreator('Team', `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`, `Hey Team`, `A new version has been detected for ${newVersion.ProductName.replace(/_/g, ' ')}`, `Version:`, ``, `${newVersion.VersionName}`, `Release Date:`, `${newVersion.ReleaseDate? newVersion.ReleaseDate.toDateString() : 'No release date'}`)
       

        try{

        await sendEmail({
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


async function sendEmail({ 
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
  
          const frequencyMs = getMilliseconds(mailbox.UnitOfTime);
          const totalOffset = mailbox.Frequency * frequencyMs;
          console.log('Total time offset:', totalOffset);
  
          const nextUpdateTime = lastUpdateMs + totalOffset;

      
  
          const shouldSendEmail = 
            subject.includes('End of Support Date Change:') || 
            subject.includes('Version Changes Detected:') || 
            nextUpdateTime < new Date().getTime();
  
          if (shouldSendEmail) {
            const info = await transporter.sendMail({
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
                logger.info('Email sent and last_update updated:', { info, mailbox });
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
  
 



export { notify_on_end_of_support, notify_new_version, sendEmail, parseDate, notify_on_end_of_support_changes, extract_versions_from_json,extract_fortra_versions_to_json,extract_Opswat_Key_Indexes, extract_fortra_versions };
