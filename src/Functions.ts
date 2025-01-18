import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { VersionData } from './types';
import { createEmailTemplate } from './emailTemplate';
import { Type1Products, Type2Products, version_extracted } from './types';
import { isinit, logger } from './index';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from './index';


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

        
        emailBody = {
            name:'Team',
            subject: `End of Extended Support Alert: ${product} ${version}`,
            row1: `Hey Team`,
            row2: `The end of extended support date for ${product} ${version} is approaching.`,
            row3: `End of Support Date:`,
            row4: `The end of extended support date for ${product} ${version} is:`,
            row5: `${versionData.Extended_Support_End_Date?.toDateString()} ,`,
            row6: `Number of days remaining:`,
            row7: `${daysUntilEOS}`

        }

    }

    else{
    
    if (daysUntilEOS <= 7) { // Notify when 30 days or less remaining

        emailBody = {
            name:'Team',
            subject: `Critical: End of Support Approaching - 7 days or less remaining`,
            row1: `Hey Team`,
            row2: `The end of support date for ${product} ${version} is approaching.`,
            row3: `End of Support Date:`,
            row4: `The end of support date for ${product} ${version} is:`,
            row5: `${versionData.EndOfSupportDate?.toDateString()} ,`,
            row6: `Number of days remaining:`,
            row7: `${daysUntilEOS}`
        }
        
      
        
    
    }
    else if (daysUntilEOS <= 30) {
        emailBody = {
            name:'Team',
            subject: `End of Support Alert: ${product} ${version}`,
            row1: `Hey Team`,
            row2: `The end of support date for ${product} ${version} is approaching.`,
            row3: `End of Support Date:`,
            row4: `The end of support date for ${product} ${version} is:`,
            row5: `${versionData.EndOfSupportDate?.toDateString()} ,`,
            row6: `Number of days remaining:`,
            row7: `${daysUntilEOS}`

        }
  
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


        switch(cheerio.load(listofVersions)(listoftd[i]).text().toLowerCase()){
            case 'mft':
                listofVersions_ret.Goanywhere_MFT.push({
                    version_name: cheerio.load(listofVersions)(listoftd[i+1]).text(),
                    release_date: cheerio.load(listofVersions)(listoftd[i+3]).text(),
                    end_of_support_date: cheerio.load(listofVersions)(listoftd[i+6]).text(),
                    level_of_support: cheerio.load(listofVersions)(listoftd[i+2]).text(),
                    extended_support_end_date: cheerio.load(listofVersions)(listoftd[i+5]).text(),
                    eosl_start_date: cheerio.load(listofVersions)(listoftd[i+4]).text(),
             
                });
                break;
            case 'gateway':
                listofVersions_ret.Goanywhere_Gateway.push({
                    version_name: cheerio.load(listofVersions)(listoftd[i+1]).text(),
                    release_date: cheerio.load(listofVersions)(listoftd[i+3]).text(),
                    end_of_support_date: cheerio.load(listofVersions)(listoftd[i+6]).text(),
                    level_of_support: cheerio.load(listofVersions)(listoftd[i+2]).text(),
                    extended_support_end_date: cheerio.load(listofVersions)(listoftd[i+5]).text(),
                    eosl_start_date: cheerio.load(listofVersions)(listoftd[i+4]).text(),
                });
                break;
            case 'agents':
                listofVersions_ret.Goanywhere_Agent.push({
                    version_name: cheerio.load(listofVersions)(listoftd[i+1]).text(),
                    release_date: cheerio.load(listofVersions)(listoftd[i+3]).text(),
                    end_of_support_date: cheerio.load(listofVersions)(listoftd[i+6]).text(),
                    level_of_support: cheerio.load(listofVersions)(listoftd[i+2]).text(),
                    extended_support_end_date: cheerio.load(listofVersions)(listoftd[i+5]).text(),
                    eosl_start_date: cheerio.load(listofVersions)(listoftd[i+4]).text(),

                });
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


    const emailBody =
        
        {
            name:'Team',
            subject: `End of Support Date Change: ${product} ${version}`,
            row1: `Hey Team`,
            row2: `The end of support date for ${product} ${version} has been changed.`,
            row3: `Changes Detected:`,
            row4: `End of Support Date changed from `,
            row5: `${oldDate ? oldDate.toDateString() : 'No old date'}`,
            row6: `to`,
            row7: `${newDate ? newDate.toDateString() : 'No new date'}`
        }

  


        try{

        await sendEmail({
            subject: `End of Support Date Change: ${product} ${version}`,
            content: emailBody,
            vendor_name: vendor,
            users_array: users_array
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
    }
    

    
}


async function extract_JSON_URL(url:string){

    try {


    const object= await axios.get(url);
    //get the last element in the array in the object that called "publicVersions"
    const publicVersions= object.data.publicVersions;
    const lengthpublicVersions= publicVersions.length;
    let relevant_obj= publicVersions[lengthpublicVersions-1]
    relevant_obj= relevant_obj.publicDocumentations.find((element:any)=> element.slug.includes('knowledgebase') || element.slug.includes('knowledge-base'));
   //write as txt each time

    const objwithpageonly= relevant_obj.publicIndxes;
    const arrayofpages:any[]=[];

    for(let i=0; i<objwithpageonly.length; i++){
      
        if(objwithpageonly[i].page!==undefined){
            //note for myself to convert it to regex with 'how-long-is-the-support-lifecycle-for-a-specific-version-of-' or 'how-long-is-the-support-life-cycle-for-a-' 
            const regex= /how-long-is-the-support-lifecycle-for-a-specific-version-of-|how-long-is-the-support-life-cycle-for-a-/;
            if(objwithpageonly[i].page?.slug.match(regex)){

                console.log('relevant page')
                identifier++;

                               
                arrayofpages.push(objwithpageonly[i].page);
            }
            
        }
    }

    const concated_indexes:string[]= arrayofpages.map((element:any)=> element.id);
    return concated_indexes;


}
catch(error){
    logger.error('Error extracting JSON URL:', { error });
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

function isType1Product(productName: string): productName is Type1Products {
    return ['Metadefender_Core', 'OCMv7', 'Metadefender_Kiosk', 'Metadefender_Vault', 'Metadefender_Gateway_Email_Security', 'Metadefender_Icap_Server', 'Metadefender_MFT', 'Metadefender_Cloud'].includes(productName);
}

async function notify_new_version(newVersion: VersionData, users_array?: any) {
    
    // Compare relevant fields
    
    
        const emailBody = {
            name:'Team',
            subject: `Version Changes Detected: ${newVersion.ProductName}`,
            row1: `Hey Team`,
            row2: `A new version has been detected for ${newVersion.ProductName}`,
            row3: `Version:`,
            row4: ``,
            row5: `${newVersion.VersionName}`,
            row6: `Release Date:`,
            row7: `${newVersion.ReleaseDate? newVersion.ReleaseDate.toDateString() : 'No release date'}`,
          
        }

        try{

        await sendEmail({
            subject: `Version Changes Detected: ${newVersion.ProductName}`,
            content: emailBody,
            vendor_name: newVersion.VendorName,
            users_array: users_array
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
    }
    
}

async function sendEmail({ subject, content, vendor_name, users_array }: { subject: string, content: any, vendor_name:string, users_array?: any}) {

    if(users_array===undefined || users_array==='' || isinit===true){
        return
    }

    console.log('users_array', users_array);

    const transporter = nodemailer.createTransport({
        host: "mail.bulwarx.local", // Exchange server address
        port: 25,                  // Standard secure SMTP port
        secure: false,              // true for 465, false for other ports
   
        tls: {
            ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3',  // Supports multiple cipher suites
            rejectUnauthorized: false
        }
    });

    try {

        for(const mailbox of users_array){

            if(new Date(mailbox.Last_Update).getTime() + mailbox.Unit_of_time * mailbox.Frequency * (mailbox.Frequency==='Hours'? 3600000 : mailbox.Frequency==='Days'? 86400000 : mailbox.Frequency==='Weeks'? 604800000 : mailbox.Frequency==='Months'? 2629746000 : 0) < new Date().getTime()){  

                const info = await transporter.sendMail({
                    from: process.env.USER_EMAIL,
                    to: mailbox.Email,
                    subject: subject,
                    html: createEmailTemplate(content, vendor_name)
            
        });


        console.log('Email sent:', info.messageId);
        logger.info('Email sent:', { info });
        return info;
    }
    else{
        logger.info('Email not sent (last update is not old enough):', { mailbox });
    }
    }
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export { notify_on_end_of_support, notify_new_version, sendEmail, parseDate, notify_on_end_of_support_changes, extract_versions_from_json,extract_fortra_versions_to_json,extract_JSON_URL };
