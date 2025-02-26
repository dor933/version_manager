"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.extract_versions_from_json = extract_versions_from_json;
exports.extract_fortra_versions_to_json = extract_fortra_versions_to_json;
exports.extract_Opswat_Key_Indexes = extract_Opswat_Key_Indexes;
exports.extract_fortra_versions = extract_fortra_versions;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = require("./index");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const index_2 = require("./index");
let identifier = 0;
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
    return null;
}
function notify_on_end_of_support(versionData, daysUntilEOS, daysUntilExtendedEOS, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const product = versionData.ProductName;
        const version = versionData.VersionName;
        // Calculate days until end of support
        let emailBody = {};
        if (daysUntilExtendedEOS) {
            emailBody = {
                name: 'Team',
                subject: `End of Extended Support Alert: ${product.replace(/_/g, ' ')} ${version}`,
                row1: `Hey Team`,
                row2: `The end of extended support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`,
                row3: `End of Support Date:`,
                row4: `The end of extended support date for ${product.replace(/_/g, ' ')} ${version} is:`,
                row5: `${(_a = versionData.ExtendedSupportEndDate) === null || _a === void 0 ? void 0 : _a.toDateString()} ,`,
                row6: `Number of days remaining:`,
                row7: `${daysUntilEOS}`
            };
        }
        else {
            if (daysUntilEOS <= 7) { // Notify when 30 days or less remaining
                emailBody = {
                    name: 'Team',
                    subject: `Critical: End of Support Approaching - 7 days or less remaining`,
                    row1: `Hey Team`,
                    row2: `The end of support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`,
                    row3: `End of Support Date:`,
                    row4: `The end of support date for ${product.replace(/_/g, ' ')} ${version} is:`,
                    row5: `${(_b = versionData.EndOfSupportDate) === null || _b === void 0 ? void 0 : _b.toDateString()} ,`,
                    row6: `Number of days remaining:`,
                    row7: `${daysUntilEOS}`
                };
            }
            else if (daysUntilEOS <= 30) {
                emailBody = {
                    name: 'Team',
                    subject: `End of Support Alert: ${product.replace(/_/g, ' ')} ${version}`,
                    row1: `Hey Team`,
                    row2: `The end of support date for ${product.replace(/_/g, ' ')} ${version} is approaching.`,
                    row3: `End of Support Date:`,
                    row4: `The end of support date for ${product.replace(/_/g, ' ')} ${version} is:`,
                    row5: `${(_c = versionData.EndOfSupportDate) === null || _c === void 0 ? void 0 : _c.toDateString()} ,`,
                    row6: `Number of days remaining:`,
                    row7: `${daysUntilEOS}`
                };
            }
        }
        try {
            yield sendEmail({
                subject: `End of Support Alert: ${product} ${version}`,
                content: emailBody,
                vendor_name: versionData.VendorName,
                users_array: users_array
            });
        }
        catch (error) {
            index_1.logger.error('Error sending email:', { error });
        }
    });
}
function extract_fortra_versions(productname, listoffortraversions) {
    return __awaiter(this, void 0, void 0, function* () {
        let fortra_version_extracted = [];
        let listnew = listoffortraversions[productname];
        for (const version of listnew) {
            fortra_version_extracted.push([
                version.version_name,
                version.release_date,
                version.end_of_support_date,
                version.level_of_support,
                version.extended_support_end_date,
                version.eosl_start_date
            ]);
        }
        return fortra_version_extracted;
    });
}
function extract_fortra_versions_to_json(json_url) {
    return __awaiter(this, void 0, void 0, function* () {
        let listofVersions = yield axios_1.default.get(json_url);
        listofVersions = listofVersions.data.content;
        //extract from the html the <td> tags with cheerio
        try {
            const $ = cheerio.load(listofVersions);
            let listoftd = $('td');
            let listofVersions_ret = {
                Goanywhere_MFT: [],
                Goanywhere_Gateway: [],
                Goanywhere_Agent: [],
            };
            for (let i = 0; i < listoftd.length; i += 7) {
                switch (cheerio.load(listofVersions)(listoftd[i]).text().toLowerCase()) {
                    case 'mft':
                        listofVersions_ret.Goanywhere_MFT.push({
                            version_name: cheerio.load(listofVersions)(listoftd[i + 1]).text(),
                            release_date: cheerio.load(listofVersions)(listoftd[i + 3]).text(),
                            end_of_support_date: cheerio.load(listofVersions)(listoftd[i + 6]).text(),
                            level_of_support: cheerio.load(listofVersions)(listoftd[i + 2]).text(),
                            extended_support_end_date: cheerio.load(listofVersions)(listoftd[i + 5]).text(),
                            eosl_start_date: cheerio.load(listofVersions)(listoftd[i + 4]).text(),
                        });
                        break;
                    case 'gateway':
                        listofVersions_ret.Goanywhere_Gateway.push({
                            version_name: cheerio.load(listofVersions)(listoftd[i + 1]).text(),
                            release_date: cheerio.load(listofVersions)(listoftd[i + 3]).text(),
                            end_of_support_date: cheerio.load(listofVersions)(listoftd[i + 6]).text(),
                            level_of_support: cheerio.load(listofVersions)(listoftd[i + 2]).text(),
                            extended_support_end_date: cheerio.load(listofVersions)(listoftd[i + 5]).text(),
                            eosl_start_date: cheerio.load(listofVersions)(listoftd[i + 4]).text(),
                        });
                        break;
                    case 'agents':
                        listofVersions_ret.Goanywhere_Agent.push({
                            version_name: cheerio.load(listofVersions)(listoftd[i + 1]).text(),
                            release_date: cheerio.load(listofVersions)(listoftd[i + 3]).text(),
                            end_of_support_date: cheerio.load(listofVersions)(listoftd[i + 6]).text(),
                            level_of_support: cheerio.load(listofVersions)(listoftd[i + 2]).text(),
                            extended_support_end_date: cheerio.load(listofVersions)(listoftd[i + 5]).text(),
                            eosl_start_date: cheerio.load(listofVersions)(listoftd[i + 4]).text(),
                        });
                        break;
                }
            }
            return listofVersions_ret;
        }
        catch (error) {
            index_1.logger.error('error extracting fortra versions to json', error);
            return [];
        }
    });
}
function notify_on_end_of_support_changes(product, vendor, version, oldDate, newDate, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        const emailBody = {
            name: 'Team',
            subject: `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`,
            row1: `Hey Team`,
            row2: `The end of support date for ${product.replace(/_/g, ' ')} ${version} has been changed.`,
            row3: `Changes Detected:`,
            row4: `End of Support Date changed from `,
            row5: `${oldDate ? oldDate.toDateString() : 'No old date'}`,
            row6: `to`,
            row7: `${newDate ? newDate.toDateString() : 'No new date'}`
        };
        try {
            yield sendEmail({
                subject: `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`,
                content: emailBody,
                vendor_name: vendor,
                users_array: users_array
            });
        }
        catch (error) {
            index_1.logger.error('Error sending email:', { error });
        }
    });
}
function extract_Opswat_Key_Indexes(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            let elementfound = false;
            let i = 1;
            const object = yield axios_1.default.get(url);
            //get the last element in the array in the object that called "publicVersions"
            const publicVersions = object.data.publicVersions;
            const lengthpublicVersions = publicVersions.length;
            const arrayofpages = [];
            //only objects with publicIndxes are relevant- if not found, increment i
            while (!elementfound) {
                let relevant_obj = publicVersions[lengthpublicVersions - i];
                relevant_obj = relevant_obj.publicDocumentations.find((element) => element.slug.includes('knowledgebase') || element.slug.includes('knowledge-base'));
                if (relevant_obj === null || relevant_obj === void 0 ? void 0 : relevant_obj.publicIndxes) {
                    const objwithpageonly = relevant_obj.publicIndxes;
                    for (let i = 0; i < objwithpageonly.length; i++) {
                        if (objwithpageonly[i].page !== undefined) {
                            const regex = /how-long-is-the-support-lifecycle-for-a-specific-version-of-|how-long-is-the-support-life-cycle-for-a-/;
                            if ((_a = objwithpageonly[i].page) === null || _a === void 0 ? void 0 : _a.slug.match(regex)) {
                                identifier++;
                                arrayofpages.push(objwithpageonly[i].page);
                            }
                        }
                    }
                    elementfound = true;
                }
                else {
                    i++;
                }
            }
            const concated_indexes = arrayofpages.map((element) => element.id);
            return concated_indexes;
        }
        catch (error) {
            index_1.logger.error('Error extracting JSON URL: ' + url, { error });
            return [];
        }
    });
}
function extract_versions_from_json(response_json, manufacturer, productName) {
    let version_extracted_ret = [];
    if (manufacturer === 'OPSWAT') {
        if (isType1Product(productName)) {
            let listofVersions = response_json.data.plugins;
            try {
                for (const version of listofVersions) {
                    if (version.data.contents !== undefined) {
                        version_extracted_ret = version.data.contents;
                    }
                }
                version_extracted_ret = version_extracted_ret.filter((version) => !version[0].includes('Release number') && !version[0].includes('Release Number'));
                return version_extracted_ret;
            }
            catch (error) {
                index_1.logger.error('Error extracting versions from JSON when processing Type1 product:', { error });
                return version_extracted_ret;
            }
        }
        else {
            try {
                let listofVersions = response_json.data.publicVersions;
                let listtoreturn = [];
                let i = 0;
                for (const version of listofVersions) {
                    let version_name = version.name;
                    let versobject = [version_name, null, null];
                    listtoreturn.push(versobject);
                }
                return listtoreturn;
            }
            catch (error) {
                index_1.logger.error('Error extracting versions from JSON when processing Type2 product:', { error });
                return version_extracted_ret;
            }
        }
    }
    else if (manufacturer === 'FORTRA') {
        //here will be the code for FORTRA
        return response_json;
    }
    return version_extracted_ret;
}
function isType1Product(productName) {
    return ['Metadefender_Core', 'OCMv7', 'Metadefender_Kiosk', 'Metadefender_Vault', 'Metadefender_Gateway_Email_Security', 'Metadefender_Icap_Server', 'Metadefender_MFT', 'Metadefender_Cloud'].includes(productName);
}
function notify_new_version(newVersion, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        // Compare relevant fields
        const emailBody = {
            name: 'Team',
            subject: `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`,
            row1: `Hey Team`,
            row2: `A new version has been detected for ${newVersion.ProductName.replace(/_/g, ' ')}`,
            row3: `Version:`,
            row4: ``,
            row5: `${newVersion.VersionName}`,
            row6: `Release Date:`,
            row7: `${newVersion.ReleaseDate ? newVersion.ReleaseDate.toDateString() : 'No release date'}`,
        };
        try {
            yield sendEmail({
                subject: `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`,
                content: emailBody,
                vendor_name: newVersion.VendorName,
                users_array: users_array
            });
        }
        catch (error) {
            index_1.logger.error('Error sending email:', { error });
        }
    });
}
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ subject, content, vendor_name, users_array }) {
        // Early return if no users or initialization
        if (users_array === undefined || users_array === '' || index_1.isinit === true) {
            return;
        }
        const transporter = nodemailer_1.default.createTransport({
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
                    const shouldSendEmail = subject.includes('End of Support Date Change:') ||
                        subject.includes('Version Changes Detected:') ||
                        nextUpdateTime < new Date().getTime();
                    if (shouldSendEmail) {
                        // const info = await transporter.sendMail({
                        //   from: process.env.USER_EMAIL,
                        //   to: mailbox.Email,
                        //   subject: subject,
                        //   html: createEmailTemplate(content, vendor_name)
                        // });
                        // Update the last_update field in the database
                        let affectedCount = yield index_2.db.UpdateRecord('UserChosenProduct', ['LastUpdate'], [new Date().toISOString()], ['UserID', 'ProductId', 'VendorId'], [mailbox.UserID, mailbox.ProductId, mailbox.VendorId]);
                        if (affectedCount)
                            index_1.logger.info('Email sent and last_update updated:', { mailbox });
                        else
                            index_1.logger.error('Error updating last_update in database:', { mailbox });
                    }
                    else {
                        index_1.logger.info('Email not sent (last update is not old enough):', { mailbox });
                    }
                }
            }
            else {
                index_1.logger.info('No users to send email to');
            }
        }
        catch (error) {
            index_1.logger.error('Error sending email:', { error });
            throw error;
        }
    });
}
// Modify the getMilliseconds function to handle case-sensitivity
const getMilliseconds = (frequency) => {
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
