"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMilliseconds = exports.isType1Product = exports.FortraVersionObjectCreator = exports.EmailBodyCreator = void 0;
const EmailBodyCreator = (name, subject, row1, row2, row3, row4, row5, row6, row7) => {
    return {
        name: name,
        subject: subject,
        row1: row1,
        row2: row2,
        row3: row3,
        row4: row4,
        row5: row5,
        row6: row6,
        row7: row7
    };
};
exports.EmailBodyCreator = EmailBodyCreator;
const FortraVersionObjectCreator = (version, release_date, end_of_support_date, level_of_support, extended_support_end_date, eosl_start_date) => {
    return {
        version_name: version,
        release_date: release_date,
        end_of_support_date: end_of_support_date,
        level_of_support: level_of_support,
        extended_support_end_date: extended_support_end_date,
        eosl_start_date: eosl_start_date
    };
};
exports.FortraVersionObjectCreator = FortraVersionObjectCreator;
const isType1Product = (productName) => {
    return ['Metadefender_Core', 'OCMv7', 'Metadefender_Kiosk', 'Metadefender_Vault', 'Metadefender_Gateway_Email_Security', 'Metadefender_Icap_Server', 'Metadefender_MFT', 'Metadefender_Cloud'].includes(productName);
};
exports.isType1Product = isType1Product;
// Modify the getMilliseconds function to handle case-sensitivity
const GetMilliseconds = (frequency) => {
    const conversions = {
        'HOURS': 3600000,
        'DAYS': 86400000,
        'MONTHS': 2629746000,
        'Hours': 3600000,
        'Days': 86400000,
        'Months': 604800000,
    };
    const result = conversions[frequency];
    if (!result) {
        console.error('Invalid frequency:', frequency);
        return 0;
    }
    return result;
};
exports.GetMilliseconds = GetMilliseconds;
