import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { VersionData } from './types';
import { createEmailTemplate } from './emailTemplate';
import { Type1Products, Type2Products, version_extracted } from './types';
import { logger,notificationEmails,isinit } from './index';

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

    console.log(`Unable to parse date: ${dateStr}` , ',Product may not have a release or end of support date');
    return null;
}

async function notify_on_end_of_support(versionData: VersionData    , daysUntilEOS: number) {
    const product = versionData.ProductName;
    const version = versionData.VersionName;
    
    // Calculate days until end of support

    let emailBody = {}
    
    if (daysUntilEOS <= 7) { // Notify when 30 days or less remaining

        emailBody = {
            name:'Dor',
            subject: `Critical: End of Support Approaching - 7 days or less remaining`,
            row1: `Hey Dor`,
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
            name:'Dor',
            subject: `End of Support Alert: ${product} ${version}`,
            row1: `Hey Dor`,
            row2: `The end of support date for ${product} ${version} is approaching.`,
            row3: `End of Support Date:`,
            row4: `The end of support date for ${product} ${version} is:`,
            row5: `${versionData.EndOfSupportDate?.toDateString()} ,`,
            row6: `Number of days remaining:`,
            row7: `${daysUntilEOS}`

        }
  
    }
    
    console.log('emailBody',emailBody);

    try{

    await sendEmail({
        subject: `End of Support Alert: ${product} ${version}`,
        content: emailBody
    });
}
catch(error){
    logger.error('Error sending email:', { error });
}

}

async function notify_on_end_of_support_changes(product: string, vendor: string, version: string, oldDate?: Date, newDate?: Date) {


    const emailBody =
        
        {
            name:'Dor',
            subject: `End of Support Date Change: ${product} ${version}`,
            row1: `Hey Dor`,
            row2: `The end of support date for ${product} ${version} has been changed.`,
            row3: `Changes Detected:`,
            row4: `End of Support Date changed from `,
            row5: `${oldDate ? oldDate.toDateString() : 'No old date'}`,
            row6: `to`,
            row7: `${newDate ? newDate.toDateString() : 'No new date'}`
        }

  

        console.log('emailBody',emailBody);

        try{

        await sendEmail({
            subject: `End of Support Date Change: ${product} ${version}`,
            content: emailBody
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
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

async function notify_new_version(newVersion: VersionData) {
    
    // Compare relevant fields
    
    
        const emailBody = {
            name:'Dor',
            subject: `Version Changes Detected: ${newVersion.ProductName}`,
            row1: `Hey Dor`,
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
            content: emailBody
        });
    }
    catch(error){
        logger.error('Error sending email:', { error });
    }
    
}

async function sendEmail({ subject, content }: { subject: string, content: any, to?: string }) {

    if(isinit || notificationEmails===''){
        return
    }

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
        const info = await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: notificationEmails,
            subject: subject,
            html: createEmailTemplate(content)
            
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export { notify_on_end_of_support, notify_new_version, sendEmail, parseDate, notify_on_end_of_support_changes, extract_versions_from_json };
