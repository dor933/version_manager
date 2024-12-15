"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify_on_end_of_support = notify_on_end_of_support;
exports.notify_new_version = notify_new_version;
exports.sendEmail = sendEmail;
exports.parseDate = parseDate;
exports.notify_on_end_of_support_changes = notify_on_end_of_support_changes;
const nodemailer_1 = __importDefault(require("nodemailer"));
function parseDate(dateStr) {
    if (!dateStr)
        return null;
    // Try parsing various date formats
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
        // Create new date using UTC values to preserve timezone
        return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), parsedDate.getUTCHours(), parsedDate.getUTCMinutes(), parsedDate.getUTCSeconds()));
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
        return new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate()));
    }
    console.error(`Unable to parse date: ${dateStr}`);
    return null;
}
function notify_on_end_of_support(versionData, daysUntilEOS) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
            End of Support Date: ${(_a = versionData.EndOfSupportDate) === null || _a === void 0 ? void 0 : _a.toDateString()}
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
            End of Support Date: ${(_b = versionData.EndOfSupportDate) === null || _b === void 0 ? void 0 : _b.toDateString()}
            Days Remaining: ${daysUntilEOS}
            
            Please take necessary actions to upgrade or migrate from this version.
        `;
        }
        // console.log('emailBody',emailBody);
        // await sendEmail({
        //     subject: `End of Support Alert: ${product} ${version}`,
        //     body: emailBody
        // });
    });
}
function notify_on_end_of_support_changes(product, vendor, version, oldDate, newDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [];
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
            console.log('emailBody', emailBody);
            // await sendEmail({
            //     subject: `End of Support Date Change: ${product} ${version}`,
            //     body: emailBody
            // });
        }
    });
}
function notify_new_version(newVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [];
        // Compare relevant fields
        changes.push(`New Version Added: ${newVersion.VersionName}`);
        if (changes.length > 0) {
            const emailBody = `
            Version Change Notification
            
            Product: ${newVersion.ProductName}
            Changes Detected:
            ${changes.join('\n')}
        `;
            console.log('emailBody', emailBody);
            // await sendEmail({
            //     subject: `Version Changes Detected: ${newVersion.ProductName}`,
            //     body: emailBody
            // });
        }
    });
}
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ subject, body }) {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.office365.com", // Exchange server address
            port: 587, // Standard secure SMTP port
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.USER_EMAIL, // Your Exchange email
                pass: process.env.USER_PASSWORD // Your Exchange password
            },
            tls: {
                ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3', // Supports multiple cipher suites
                rejectUnauthorized: false
            }
        });
        try {
            const info = yield transporter.sendMail({
                from: process.env.USER_EMAIL,
                to: process.env.EMAIL_RECIPIENT,
                subject: subject,
                text: body,
            });
            console.log('Email sent:', info.messageId);
            return info;
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    });
}
