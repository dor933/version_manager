import fs from 'fs';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { VersionData } from './types';

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

    console.error(`Unable to parse date: ${dateStr}`);
    return null;
}

async function notify_on_end_of_support(versionData: VersionData    , daysUntilEOS: number) {
    const vendor = versionData.VendorName;
    const product = versionData.ProductName;
    const version = versionData.VersionName;
    
    // Calculate days until end of support

    let emailBody = '';
    
    if (daysUntilEOS <= 30) { // Notify when 30 days or less remaining
        emailBody = `
            Warning: End of Support Approaching
            
            Product: ${product}
            Vendor: ${vendor}
            Version: ${version}
            End of Support Date: ${versionData.EndOfSupportDate?.toDateString()}
            Days Remaining: ${daysUntilEOS}
            
            Please take necessary actions to upgrade or migrate from this version.
        `;
        
    
    }
    else if (daysUntilEOS <= 7) {
        emailBody = `
            Critical: End of Support Approaching - 7 days or less remaining
            
            Product: ${product}
            Vendor: ${vendor}
            Version: ${version}
            End of Support Date: ${versionData.EndOfSupportDate?.toDateString()}
            Days Remaining: ${daysUntilEOS}
            
            Please take necessary actions to upgrade or migrate from this version.
        `;
    }
    
    // console.log('emailBody',emailBody);

    // await sendEmail({
    //     subject: `End of Support Alert: ${product} ${version}`,
    //     body: emailBody
    // });
}

async function notify_on_end_of_support_changes(product: string, vendor: string, version: string, oldDate?: Date, newDate?: Date) {
    const changes: string[] = [];

    changes.push(`End of Support date changed from ${!oldDate ? 'null' : oldDate.toDateString()} to ${!newDate ? 'null' : newDate.toDateString()}`);

    if (changes.length > 0) {
        const emailBody = `
            End of Support Date Change Notification
            
            Product: ${product}
            Vendor: ${vendor}
            Version: ${version}
            Changes Detected:
            ${changes.join('\n')}
        `;

        console.log('emailBody',emailBody);

        // await sendEmail({
        //     subject: `End of Support Date Change: ${product} ${version}`,
        //     body: emailBody
        // });
    }

    
}

function extract_versions_from_json(response_json: any, manufacturer: string): any {

    if(manufacturer === 'OPSWAT'){

    let listofVersions = response_json.data.plugins;

    for(const version of listofVersions){
        
        if(version.data.contents!== undefined){

            listofVersions = version.data.contents;
            console.log('listofVersions',listofVersions);
        }
    }

    return listofVersions;
}

else if(manufacturer === 'FORTRA'){

    //here will be the code for FORTRA
    return response_json;
}

return null;



}

async function notify_new_version(newVersion: VersionData) {
    const changes: string[] = [];
    
    // Compare relevant fields
    changes.push(`New Version Added: ${newVersion.VersionName}`);
    
    
    if (changes.length > 0) {
        const emailBody = `
            Version Change Notification
            
            Product: ${newVersion.ProductName}
            Changes Detected:
            ${changes.join('\n')}
        `;

        console.log('emailBody',emailBody);
        
        // await sendEmail({
        //     subject: `Version Changes Detected: ${newVersion.ProductName}`,
        //     body: emailBody
        // });
    }
}

async function sendEmail({ subject, body }: { subject: string, body: string }) {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com", // Exchange server address
        port: 587,                  // Standard secure SMTP port
        secure: false,              // true for 465, false for other ports
        auth: {
            user: process.env.USER_EMAIL,     // Your Exchange email
            pass: process.env.USER_PASSWORD  // Your Exchange password
        },
        tls: {
            ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3',  // Supports multiple cipher suites
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: process.env.EMAIL_RECIPIENT,
            subject: subject,
            text: body,
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export { notify_on_end_of_support, notify_new_version, sendEmail, parseDate, notify_on_end_of_support_changes, extract_versions_from_json };
