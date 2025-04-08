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
exports.NotifyOnEndOfSupport = NotifyOnEndOfSupport;
exports.NotifyNewVersion = NotifyNewVersion;
exports.SendEmail = SendEmail;
exports.ParseDate = ParseDate;
exports.NotifyOnEndOfSupportChanges = NotifyOnEndOfSupportChanges;
exports.ExtractVersionsFromJson = ExtractVersionsFromJson;
exports.ExtractFortraVersionsToJson = ExtractFortraVersionsToJson;
exports.ExtractOpswatKeyIndexes = ExtractOpswatKeyIndexes;
exports.ExtractFortraVersions = ExtractFortraVersions;
exports.getproductsandmodules = getproductsandmodules;
exports.SendEosNotifications = SendEosNotifications;
exports.sendEosEmail = sendEosEmail;
exports.UpdateLastUpdate = UpdateLastUpdate;
exports.createEolVersionToNotify = createEolVersionToNotify;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const EmailTemplate_1 = require("../EmailTemplate");
const index_1 = require("../index");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const index_2 = require("../index");
const HelperFunctions_1 = require("./HelperFunctions");
const Schemes_1 = require("../Database/Schemes");
let identifier = 0;
function ParseDate(dateStr) {
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
function getproductsandmodules(products) {
    return __awaiter(this, void 0, void 0, function* () {
        let productsandmodules = [];
        for (let product of products) {
            let modules = yield index_2.db.getModules(product.ProductName, product.VendorName);
            let issues = yield index_2.db.getIssues(product.ProductName, product.VendorName);
            productsandmodules.push({ ProductName: product.ProductName, modules: modules, issues: issues });
        }
        return productsandmodules;
    });
}
function NotifyOnEndOfSupport(versionData, daysUntilEOS, daysUntilExtendedEOS, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        // This function is now just a placeholder since EOL notification processing 
        // is fully handled by the Database.processEolNotifications method
        // We keep this function to maintain compatibility with existing code
        index_1.logger.info(`EOL notification for ${versionData.ProductName} ${versionData.VersionName} will be handled in batch processing`);
        return;
    });
}
// This function is now redundant since the batch processing is handled
// by the Database.processEolNotifications method
function SendEosNotifications(_a) {
    return __awaiter(this, arguments, void 0, function* ({ versionData, emailBody, users_array }) {
        // Just log that we received this call but processing happens in batch
        index_1.logger.info(`EOL notification for ${versionData.ProductName} ${versionData.VersionName} will be handled in batch processing`);
        return;
    });
}
function ExtractFortraVersions(productname, listoffortraversions) {
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
function ExtractFortraVersionsToJson(json_url) {
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
                let VersionObject;
                switch (cheerio.load(listofVersions)(listoftd[i]).text().toLowerCase()) {
                    case 'mft':
                        VersionObject = (0, HelperFunctions_1.FortraVersionObjectCreator)(cheerio.load(listofVersions)(listoftd[i + 1]).text(), cheerio.load(listofVersions)(listoftd[i + 3]).text(), cheerio.load(listofVersions)(listoftd[i + 6]).text(), cheerio.load(listofVersions)(listoftd[i + 2]).text(), cheerio.load(listofVersions)(listoftd[i + 5]).text(), cheerio.load(listofVersions)(listoftd[i + 4]).text());
                        listofVersions_ret.Goanywhere_MFT.push(VersionObject);
                        break;
                    case 'gateway':
                        VersionObject = (0, HelperFunctions_1.FortraVersionObjectCreator)(cheerio.load(listofVersions)(listoftd[i + 1]).text(), cheerio.load(listofVersions)(listoftd[i + 3]).text(), cheerio.load(listofVersions)(listoftd[i + 6]).text(), cheerio.load(listofVersions)(listoftd[i + 2]).text(), cheerio.load(listofVersions)(listoftd[i + 5]).text(), cheerio.load(listofVersions)(listoftd[i + 4]).text());
                        listofVersions_ret.Goanywhere_Gateway.push(VersionObject);
                        break;
                    case 'agents':
                        VersionObject = (0, HelperFunctions_1.FortraVersionObjectCreator)(cheerio.load(listofVersions)(listoftd[i + 1]).text(), cheerio.load(listofVersions)(listoftd[i + 3]).text(), cheerio.load(listofVersions)(listoftd[i + 6]).text(), cheerio.load(listofVersions)(listoftd[i + 2]).text(), cheerio.load(listofVersions)(listoftd[i + 5]).text(), cheerio.load(listofVersions)(listoftd[i + 4]).text());
                        listofVersions_ret.Goanywhere_Agent.push(VersionObject);
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
function NotifyOnEndOfSupportChanges(product, vendor, version, oldDate, newDate, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        const emailBody = (0, HelperFunctions_1.EmailBodyCreator)('Team', `End of Support Date Change: ${product.replace(/_/g, ' ')} ${version}`, `Hey Team`, `The end of support date for ${product.replace(/_/g, ' ')} ${version} has been changed.`, `Changes Detected:`, `End of Support Date changed from `, `${oldDate ? oldDate.toDateString() : 'No old date'}`, `to`, `${newDate ? newDate.toDateString() : 'No new date'}`);
        try {
            yield SendEmail({
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
function ExtractOpswatKeyIndexes(url) {
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
function ExtractVersionsFromJson(response_json, manufacturer, productName) {
    let version_extracted_ret = [];
    if (manufacturer === 'OPSWAT') {
        if ((0, HelperFunctions_1.isType1Product)(productName)) {
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
function NotifyNewVersion(newVersion, users_array) {
    return __awaiter(this, void 0, void 0, function* () {
        // Compare relevant fields
        const emailBody = (0, HelperFunctions_1.EmailBodyCreator)('Team', `Version Changes Detected: ${newVersion.ProductName.replace(/_/g, ' ')}`, `Hey Team`, `A new version has been detected for ${newVersion.ProductName.replace(/_/g, ' ')}`, `Version:`, ``, `${newVersion.VersionName}`, `Release Date:`, `${newVersion.ReleaseDate ? newVersion.ReleaseDate.toDateString() : 'No release date'}`);
        try {
            yield SendEmail({
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
function createEolVersionToNotify(versionInfo, UsersArray, daysUntilEOS, daysUntilExtendedEOS, eolVersionsToNotify) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersByFrequency = {};
        for (const user of UsersArray) {
            const frequencyKey = user.UnitOfTime;
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
    });
}
function sendEosEmail(users, frequency, emailBody, versionInfo, IsNotificationTest) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueEmails = [...new Set(users.map((user) => user.Email))];
        let shouldSendEmail = false;
        try {
            // Get the time unit from the frequency
            const frequencyParts = frequency.split('_');
            const unitOfTime = frequencyParts[0];
            // Get the LastUpdate from the TimeUnits table
            const timeUnitRecord = yield Schemes_1.sequelize.models.TimeUnits.findOne({
                where: { UnitOfTime: unitOfTime }
            });
            if (!timeUnitRecord && !IsNotificationTest) {
                index_1.logger.warn(`No TimeUnit record found for ${unitOfTime}`);
                return;
            }
            // Calculate when the next update should be
            let nextUpdateTime;
            if (IsNotificationTest) {
                // For test notifications, always send
                shouldSendEmail = true;
            }
            else {
                // Safe access to timeUnitRecord with null check and type assertion
                if (timeUnitRecord) {
                    const lastUpdateValue = timeUnitRecord.get('LastUpdate');
                    if (lastUpdateValue) {
                        const lastUpdateTime = new Date(lastUpdateValue.toString()).getTime();
                        // Get milliseconds for this time unit (always one unit)
                        const timeUnitMs = (0, HelperFunctions_1.GetMilliseconds)(unitOfTime);
                        // No longer need to multiply by frequency value since it's always 1 unit
                        nextUpdateTime = lastUpdateTime + timeUnitMs;
                        // Determine if we should send an email now
                        shouldSendEmail = nextUpdateTime < new Date().getTime();
                    }
                    else {
                        index_1.logger.warn(`LastUpdate is null for TimeUnit ${unitOfTime}`);
                        shouldSendEmail = true; // Default to sending if no LastUpdate set
                    }
                }
                else {
                    index_1.logger.warn(`TimeUnit record not found for ${unitOfTime}`);
                    shouldSendEmail = true; // Default to sending if no TimeUnit record
                }
            }
            // Send emails to each unique user if it's time to update
            if (shouldSendEmail) {
                const transporter = nodemailer_1.default.createTransport({
                    host: "mail.bulwarx.local",
                    port: 25,
                    secure: false,
                    tls: {
                        ciphers: 'SSLv3:TLSv1:TLSv1.1:TLSv1.2:TLSv1.3',
                        rejectUnauthorized: false
                    }
                });
                for (const email of uniqueEmails) {
                    try {
                        yield transporter.sendMail({
                            from: process.env.USER_EMAIL,
                            to: email,
                            subject: `End of Support Alert: ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName}`,
                            html: (0, EmailTemplate_1.createEmailTemplate)(emailBody, versionInfo.versionData.VendorName)
                        });
                        index_1.logger.info('EOL notification sent:', {
                            email,
                            version: versionInfo.versionData.VersionName,
                            product: versionInfo.versionData.ProductName,
                            unitOfTime,
                            nextUpdateTime: nextUpdateTime ? new Date(nextUpdateTime).toISOString() : 'N/A',
                            currentTime: new Date().toISOString()
                        });
                    }
                    catch (error) {
                        index_1.logger.error('Error sending EOL email:', { error, email });
                    }
                }
                // Update the LastUpdate time for this time unit
                if (!IsNotificationTest) {
                    yield UpdateLastUpdate(frequency);
                }
            }
            else {
                index_1.logger.info('No email sent (last update is not old enough):', {
                    unitOfTime,
                    nextUpdateTime: nextUpdateTime ? new Date(nextUpdateTime).toISOString() : 'N/A',
                    currentTime: new Date().toISOString()
                });
            }
        }
        catch (error) {
            index_1.logger.error('Error processing EOL notifications:', error);
        }
    });
}
function UpdateLastUpdate(frequency) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentDate = new Date().toISOString();
            // In the new approach, the frequency string just contains the time unit
            // We're no longer using the frequency_value format
            const unitOfTime = frequency.includes('_') ? frequency.split('_')[0] : frequency;
            // Get the TimeUnit record
            const timeUnitRecord = yield Schemes_1.sequelize.models.TimeUnits.findOne({
                where: { UnitOfTime: unitOfTime }
            });
            if (timeUnitRecord) {
                // Update the LastUpdate field in the TimeUnits table
                yield Schemes_1.sequelize.models.TimeUnits.update({ LastUpdate: currentDate }, { where: { UnitOfTime: unitOfTime } });
                index_1.logger.info('Updated LastUpdate for TimeUnit:', {
                    unitOfTime,
                    lastUpdate: currentDate
                });
                // Get all products with this time unit
                const allProductsWithTimeUnit = yield Schemes_1.UserChosenProduct.findAll({
                    where: {
                        UnitOfTime: unitOfTime
                    }
                });
                index_1.logger.info('Products affected by TimeUnit update:', {
                    unitOfTime,
                    productsCount: allProductsWithTimeUnit.length
                });
            }
            else {
                index_1.logger.warn(`Cannot update LastUpdate - TimeUnit not found: ${unitOfTime}`);
            }
        }
        catch (error) {
            index_1.logger.error('Error updating LastUpdate:', error);
        }
    });
}
function SendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ subject, content, vendor_name, users_array }) {
        // Early return if no users or initialization
        if (users_array === undefined || users_array === '' || index_1.isinit === true) {
            return;
        }
        // Skip end of support notifications as they're handled by SendEosNotifications
        if (subject.includes('End of Support Alert:') || subject.includes('Critical: End of Support Approaching')) {
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
                    const frequencyMs = (0, HelperFunctions_1.GetMilliseconds)(mailbox.UnitOfTime);
                    const totalOffset = mailbox.Frequency * frequencyMs;
                    console.log('Total time offset:', totalOffset);
                    const nextUpdateTime = lastUpdateMs + totalOffset;
                    const shouldSendEmail = subject.includes('End of Support Date Change:') ||
                        subject.includes('Version Changes Detected:') ||
                        nextUpdateTime < new Date().getTime();
                    if (shouldSendEmail) {
                        yield transporter.sendMail({
                            from: process.env.USER_EMAIL,
                            to: mailbox.Email,
                            subject: subject,
                            html: (0, EmailTemplate_1.createEmailTemplate)(content, vendor_name)
                        });
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
