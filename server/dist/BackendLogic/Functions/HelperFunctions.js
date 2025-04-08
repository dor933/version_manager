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
// Get milliseconds for a time unit (Day, Week, Month)
const GetMilliseconds = (timeUnit) => {
    const conversions = {
        'DAY': 86400000, // 24 * 60 * 60 * 1000 (1 day in ms)
        'WEEK': 604800000, // 7 * 24 * 60 * 60 * 1000 (7 days in ms)
        'MONTH': 2629746000, // ~30.44 days in ms (average month)
        'Day': 86400000,
        'Week': 604800000,
        'Month': 2629746000,
    };
    const result = conversions[timeUnit];
    if (!result) {
        console.error('Invalid time unit:', timeUnit);
        return 0;
    }
    return result;
};
exports.GetMilliseconds = GetMilliseconds;
