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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify_on_end_of_support = notify_on_end_of_support;
exports.notify_version_changes = notify_version_changes;
exports.sendEmail = sendEmail;
exports.parseDate = parseDate;
function parseDate(dateStr) {
    if (!dateStr)
        return null;
    // Try parsing various date formats
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    }
    // Try parsing "September 6, 2023" format
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];
    const parts = dateStr.toLowerCase().match(/(\w+)\s+(\d+),?\s+(\d{4})/);
    if (parts) {
        const month = monthNames.indexOf(parts[1]);
        if (month !== -1) {
            return new Date(parseInt(parts[3]), month, parseInt(parts[2]));
        }
    }
    // Try parsing "06 Oct 2022" format
    const shortParts = dateStr.match(/(\d{2})\s+(\w{3})\s+(\d{4})/);
    if (shortParts) {
        return new Date(`${shortParts[2]} ${shortParts[1]} ${shortParts[3]}`);
    }
    console.error(`Unable to parse date: ${dateStr}`);
    return null;
}
function notify_on_end_of_support(vers, daysUntilEOS) {
    return __awaiter(this, void 0, void 0, function* () {
        const vendor = vers.Product.Vendor;
        const product = vers.Product;
        const version = vers;
        // Calculate days until end of support
        let emailBody = '';
        if (daysUntilEOS <= 30) { // Notify when 30 days or less remaining
            emailBody = `
            Warning: End of Support Approaching
            
            Product: ${product.ProductName}
            Vendor: ${vendor.VendorName}
            Version: ${version.VersionNumber}
            End of Support Date: ${version.EndOfSupportDate.toDateString()}
            Days Remaining: ${daysUntilEOS}
            
            Please take necessary actions to upgrade or migrate from this version.
        `;
        }
        else if (daysUntilEOS <= 7) {
            emailBody = `
            Critical: End of Support Approaching - 7 days or less remaining
            
            Product: ${product.ProductName}
            Vendor: ${vendor.VendorName}
            Version: ${version.VersionNumber}
            End of Support Date: ${version.EndOfSupportDate.toDateString()}
            Days Remaining: ${daysUntilEOS}
            
            Please take necessary actions to upgrade or migrate from this version.
        `;
        }
        yield sendEmail({
            subject: `End of Support Alert: ${product.ProductName} ${version.VersionNumber}`,
            body: emailBody
        });
    });
}
function notify_version_changes(oldVersion, newVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [];
        // Compare relevant fields
        if (oldVersion.VersionNumber !== newVersion.VersionNumber) {
            changes.push(`Version number changed from ${oldVersion.VersionNumber} to ${newVersion.VersionNumber}`);
        }
        if (oldVersion.EndOfSupportDate.getTime() !== newVersion.EndOfSupportDate.getTime()) {
            changes.push(`End of Support date changed from ${oldVersion.EndOfSupportDate.toDateString()} to ${newVersion.EndOfSupportDate.toDateString()}`);
        }
        // Add more field comparisons as needed
        if (changes.length > 0) {
            const emailBody = `
            Version Change Notification
            
            Product: ${newVersion.Product.ProductName}
            Vendor: ${newVersion.Product.Vendor.VendorName}
            
            Changes Detected:
            ${changes.join('\n')}
        `;
            yield sendEmail({
                subject: `Version Changes Detected: ${newVersion.Product.ProductName}`,
                body: emailBody
            });
        }
    });
}
// Helper function for sending emails (implementation depends on your email service)
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ subject, body }) {
        // Implement your email sending logic here
        // Example: using AWS SES, SendGrid, or other email service
        console.log('Sending email:', { subject, body });
    });
}
