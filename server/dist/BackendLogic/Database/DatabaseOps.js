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
const LogicFunctions_1 = require("../Functions/LogicFunctions");
const LogicFunctions_2 = require("../Functions/LogicFunctions");
const HelperFunctions_1 = require("../Functions/HelperFunctions");
const Data = require("../../../Data.json");
const index_1 = require("../index");
const Schemes_1 = require("./Schemes");
const Schemes_2 = require("./Schemes");
const axios_1 = __importDefault(require("axios"));
const LogicFunctions_3 = require("../Functions/LogicFunctions");
class Database {
    constructor() {
        this.sequelize = Schemes_2.sequelize;
    }
    HandleData(testOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            // Special handling for test notifications
            if ((testOptions === null || testOptions === void 0 ? void 0 : testOptions.email) && (testOptions === null || testOptions === void 0 ? void 0 : testOptions.productToNotify)) {
                return yield this.processTestNotifications(testOptions.email, testOptions.productToNotify, testOptions.unitOfTime || 'Days', testOptions.interval || 7, testOptions.vendorToNotify || 'All');
            }
            let listoffortraversions = yield (0, LogicFunctions_1.ExtractFortraVersionsToJson)(Data.Vendors[1].JSON_URL);
            // Collection to store versions that need EOL notifications
            const eolVersionsToNotify = [];
            try {
                //vendor processing
                for (const vendor of Data.Vendors) {
                    yield Schemes_1.Vendor.findOrCreate({
                        where: { VendorName: vendor.VendorName },
                        defaults: {
                            ContactInfo: vendor.contactInfo,
                            WebsiteUrl: vendor.WebsiteUrl,
                        },
                    });
                    //product processing
                    for (const product of vendor.Products) {
                        let productRecord = yield Schemes_1.Product.findOrCreate({
                            where: {
                                ProductName: product.ProductName,
                                //Because we want to save consistenty when we re-initialize the database, we need to search the VendorId by vendor name
                                VendorId: (_a = (yield Schemes_1.Vendor.findOne({
                                    where: { VendorName: vendor.VendorName },
                                }))) === null || _a === void 0 ? void 0 : _a.get("VendorId"),
                            },
                            defaults: {
                                JSON_URL: product.JSON_URL,
                                ReleaseNotes: product.release_notes,
                            },
                        });
                        if (product.modules) {
                            for (const module of product.modules) {
                                yield Schemes_2.sequelize.models.Module.findOrCreate({
                                    //Because we want to save consistenty when we re-initialize the database, we need to search the VendorId by vendor name
                                    where: {
                                        ModuleName: module,
                                        ProductId: productRecord[0].get("ProductId"),
                                        VendorId: (_b = (yield Schemes_1.Vendor.findOne({
                                            where: { VendorName: vendor.VendorName },
                                        }))) === null || _b === void 0 ? void 0 : _b.get("VendorId"),
                                    },
                                    defaults: { ModuleName: module },
                                });
                            }
                        }
                        //versions extraction
                        let listofversions = [];
                        if (vendor.VendorName === "Fortra") {
                            listofversions = yield (0, LogicFunctions_1.ExtractFortraVersions)(product.ProductName, listoffortraversions);
                        }
                        else {
                            if (product.BASE_URL) {
                                try {
                                    const ids = yield (0, LogicFunctions_1.ExtractOpswatKeyIndexes)(product.JSON_URL);
                                    const merged_listofversions = [];
                                    for (const index of ids) {
                                        const jsonRequest = product.BASE_URL + index;
                                        let listofversionstemp = yield axios_1.default.get(jsonRequest);
                                        listofversionstemp = (0, LogicFunctions_1.ExtractVersionsFromJson)(listofversionstemp, vendor.VendorName, product.ProductName);
                                        merged_listofversions.push(...listofversionstemp);
                                    }
                                    listofversions = merged_listofversions;
                                }
                                catch (error) {
                                    index_1.logger.error("Error fetching data:", error);
                                    throw error;
                                }
                            }
                            else {
                                listofversions = yield axios_1.default.get(product.JSON_URL);
                                listofversions = (0, LogicFunctions_1.ExtractVersionsFromJson)(listofversions, vendor.VendorName, product.ProductName);
                            }
                        }
                        //let us know how new is the version (the smaller the index the newer the version)
                        let ProductVersionIndex = 0;
                        //version processing
                        for (const version of listofversions) {
                            let UsersArray = yield this.GetUsersArray(product.ProductName, vendor.VendorName);
                            let VersionNameExtracted = version[0];
                            if (!VersionNameExtracted) {
                                index_1.logger.warn(`Skipping version with undefined name for product ${product.ProductName}`);
                                continue; // Skip this version and continue with the next one
                            }
                            let ReleaseDate_DateTime = (0, LogicFunctions_2.ParseDate)(version[1]);
                            let EndOfSupportDate_DateTime = (0, LogicFunctions_2.ParseDate)(version[2]);
                            let LevelOfSupport = version[3];
                            let ExtendedEndOfSupportDate = (0, LogicFunctions_2.ParseDate)(version[4]);
                            let EOSL_Start_Date = (0, LogicFunctions_2.ParseDate)(version[5]);
                            let release_notes;
                            if (vendor.VendorName === "OPSWAT") {
                                if (ProductVersionIndex !== 0) {
                                    if (product.ProductName === "Metadefender_Core") {
                                        release_notes =
                                            product.release_notes +
                                                "/archived-release-notes#version-v" +
                                                VersionNameExtracted.replace(/Version |[Vv]|\./g, "");
                                    }
                                    else {
                                        release_notes = product.archive_release_notes;
                                    }
                                }
                                else {
                                    release_notes = product.release_notes;
                                }
                            }
                            else if (vendor.VendorName === "Fortra") {
                                release_notes = product.release_notes;
                            }
                            const VersionData = {
                                VersionName: VersionNameExtracted,
                                ProductName: product.ProductName,
                                VendorName: vendor.VendorName,
                                ReleaseDate: ReleaseDate_DateTime
                                    ? ReleaseDate_DateTime
                                    : undefined,
                                EndOfSupportDate: EndOfSupportDate_DateTime
                                    ? EndOfSupportDate_DateTime
                                    : undefined,
                                LevelOfSupport: LevelOfSupport ? LevelOfSupport : undefined,
                                ExtendedSupportEndDate: ExtendedEndOfSupportDate
                                    ? ExtendedEndOfSupportDate
                                    : undefined,
                                EoslStartDate: EOSL_Start_Date ? EOSL_Start_Date : undefined,
                                FullReleaseNotes: release_notes,
                            };
                            const [versionRecord, created] = yield Schemes_1.Version.findOrCreate({
                                where: {
                                    VersionName: VersionData.VersionName,
                                    //since product id defined in database and we want to let the db re-initialize the product if it is not found, we need to search it by product name and vendor id
                                    ProductId: (_c = (yield Schemes_1.Product.findOne({
                                        where: {
                                            ProductName: VersionData.ProductName,
                                            VendorId: vendor.VendorId,
                                        },
                                    }))) === null || _c === void 0 ? void 0 : _c.get("ProductId"),
                                    //since vendor id defined in database and we want to let the db re-initialize the vendor if it is not found, we need to search it by vendor name
                                    VendorId: (_d = (yield Schemes_1.Vendor.findOne({
                                        where: {
                                            VendorName: vendor.VendorName,
                                        },
                                    }))) === null || _d === void 0 ? void 0 : _d.get("VendorId"),
                                },
                                include: [
                                    {
                                        model: Schemes_1.Product,
                                        attributes: ["ProductId"],
                                        where: {
                                            ProductName: VersionData.ProductName,
                                        },
                                    },
                                    {
                                        model: Schemes_1.Vendor,
                                        attributes: ["VendorId"],
                                        where: {
                                            VendorName: vendor.VendorName,
                                        },
                                    },
                                ],
                                defaults: {
                                    //as mentioned before, we need to let the db re-initialize the product if it is not found, so we need to search it by product name and vendor id
                                    ProductId: ((_e = (yield Schemes_1.Product.findOne({
                                        where: {
                                            ProductName: VersionData.ProductName,
                                            VendorId: vendor.VendorId,
                                        },
                                    }))) === null || _e === void 0 ? void 0 : _e.get("ProductId")) || null,
                                    //as mentioned before, we need to let the db re-initialize the vendor if it is not found, so we need to search it by vendor name
                                    VendorId: ((_f = (yield Schemes_1.Vendor.findOne({
                                        where: {
                                            VendorName: vendor.VendorName,
                                        },
                                    }))) === null || _f === void 0 ? void 0 : _f.get("VendorId")) || null,
                                    ReleaseDate: VersionData.ReleaseDate,
                                    EndOfSupportDate: VersionData.EndOfSupportDate,
                                    LevelOfSupport: VersionData.LevelOfSupport,
                                    ExtendedSupportEndDate: VersionData.ExtendedSupportEndDate,
                                    EoslStartDate: VersionData.EoslStartDate,
                                    FullReleaseNotes: VersionData.FullReleaseNotes,
                                    Timestamp: new Date(),
                                },
                            });
                            if (!created) {
                                if (((_g = versionRecord.get("EndOfSupportDate")) === null || _g === void 0 ? void 0 : _g.getTime()) !==
                                    (EndOfSupportDate_DateTime === null || EndOfSupportDate_DateTime === void 0 ? void 0 : EndOfSupportDate_DateTime.getTime())) {
                                    yield versionRecord.update({
                                        EndOfSupportDate: EndOfSupportDate_DateTime,
                                    });
                                    yield (0, LogicFunctions_1.NotifyOnEndOfSupportChanges)(product.ProductName, vendor.VendorName, VersionData.VersionName, versionRecord.get("EndOfSupportDate"), EndOfSupportDate_DateTime, UsersArray);
                                }
                            }
                            else {
                                yield (0, LogicFunctions_1.NotifyNewVersion)(VersionData, UsersArray);
                            }
                            if (EndOfSupportDate_DateTime) {
                                let daysUntilExtendedEOS;
                                const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24));
                                if (ExtendedEndOfSupportDate) {
                                    daysUntilExtendedEOS = Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) /
                                        (1000 * 60 * 60 * 24));
                                }
                                if ((daysUntilEOS <= 30 && daysUntilEOS >= 0) ||
                                    (daysUntilExtendedEOS && daysUntilExtendedEOS < 14)) {
                                    // Instead of calling NotifyOnEndOfSupport directly, collect versions that need notification
                                    if (UsersArray && UsersArray.length > 0) {
                                        // Group users by frequency
                                        yield (0, LogicFunctions_1.createEolVersionToNotify)(VersionData, UsersArray, daysUntilEOS, daysUntilExtendedEOS, eolVersionsToNotify);
                                    }
                                }
                            }
                            ProductVersionIndex++;
                        }
                    }
                }
                // Process all EOL notifications at once
                if (eolVersionsToNotify.length > 0) {
                    yield this.processEolNotifications(eolVersionsToNotify);
                }
                index_1.logger.info("Successfully completed version check");
                return true;
            }
            catch (error) {
                index_1.logger.error("Error in handleData", error);
                return error;
            }
        });
    }
    // New method to process all EOL notifications in batches by frequency
    processEolNotifications(eolVersionsToNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                index_1.logger.info(JSON.stringify(eolVersionsToNotify) + 'eolVersionsToNotify');
                // Group versions by frequency
                const versionsByFrequency = {};
                // Collect unique versions and users for each frequency
                for (const item of eolVersionsToNotify) {
                    if (!versionsByFrequency[item.frequency]) {
                        versionsByFrequency[item.frequency] = {
                            versions: [],
                            users: []
                        };
                    }
                    // Add version if not already added for this frequency
                    const versionExists = versionsByFrequency[item.frequency].versions.some(v => v.versionData.VersionName === item.versionData.VersionName &&
                        v.versionData.ProductName === item.versionData.ProductName);
                    if (!versionExists) {
                        versionsByFrequency[item.frequency].versions.push({
                            versionData: item.versionData,
                            daysUntilEOS: item.daysUntilEOS,
                            daysUntilExtendedEOS: item.daysUntilExtendedEOS
                        });
                    }
                    // Add unique users
                    for (const user of item.users) {
                        const userExists = versionsByFrequency[item.frequency].users.some(u => u.Email === user.Email &&
                            u.ProductId === user.ProductId &&
                            u.VendorId === user.VendorId);
                        if (!userExists) {
                            versionsByFrequency[item.frequency].users.push(user);
                        }
                    }
                }
                // Process notifications for each frequency group
                for (const frequency in versionsByFrequency) {
                    const { versions, users } = versionsByFrequency[frequency];
                    // Send notifications for each version
                    for (const versionInfo of versions) {
                        // Create appropriate email body for the notification
                        let emailBody;
                        if (versionInfo.daysUntilExtendedEOS) {
                            emailBody = (0, HelperFunctions_1.EmailBodyCreator)('Team', `End of Extended Support Alert: ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName}`, `Hey Team`, `The end of extended support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of extended support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is:`, `${(_a = versionInfo.versionData.ExtendedSupportEndDate) === null || _a === void 0 ? void 0 : _a.toDateString()} ,`, `Number of days remaining:`, `${versionInfo.daysUntilExtendedEOS}`);
                        }
                        else if (versionInfo.daysUntilEOS <= 7) {
                            emailBody = (0, HelperFunctions_1.EmailBodyCreator)('Team', `Critical: End of Support Approaching - 7 days or less remaining`, `Hey Team`, `The end of support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is:`, `${(_b = versionInfo.versionData.EndOfSupportDate) === null || _b === void 0 ? void 0 : _b.toDateString()} ,`, `Number of days remaining:`, `${versionInfo.daysUntilEOS}`);
                        }
                        else {
                            emailBody = (0, HelperFunctions_1.EmailBodyCreator)('Team', `End of Support Alert: ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName}`, `Hey Team`, `The end of support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of support date for ${versionInfo.versionData.ProductName.replace(/_/g, ' ')} ${versionInfo.versionData.VersionName} is:`, `${(_c = versionInfo.versionData.EndOfSupportDate) === null || _c === void 0 ? void 0 : _c.toDateString()} ,`, `Number of days remaining:`, `${versionInfo.daysUntilEOS}`);
                        }
                        yield (0, LogicFunctions_3.sendEosEmail)(users, frequency, emailBody, versionInfo);
                        // Update LastUpdate for ALL products with this frequency
                        yield (0, LogicFunctions_1.UpdateLastUpdate)(frequency);
                    }
                }
            }
            catch (error) {
                index_1.logger.error('Error processing EOL notifications:', error);
            }
        });
    }
    UpdateRecord(table, columns, values, whereColumn, whereValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create update object from columns and values
                const updateValues = columns.reduce((obj, col, index) => {
                    obj[col] = values[index];
                    return obj;
                }, {});
                // Create where object from whereColumn and whereValue
                const whereConditions = whereColumn.reduce((obj, col, index) => {
                    obj[col] = whereValue[index];
                    return obj;
                }, {});
                // Get the model dynamically
                const model = Schemes_2.sequelize.models[table];
                //get back the record that was updated
                const [affectedCount] = yield model.update(updateValues, {
                    where: whereConditions,
                });
                if (affectedCount === 0) {
                    return false;
                }
                else {
                    const updatedRecord = yield model.findOne({ where: whereConditions });
                    return updatedRecord;
                }
            }
            catch (err) {
                index_1.logger.error("Error in UpdateRecord:", err);
                throw err;
            }
        });
    }
    getAll(model_1) {
        return __awaiter(this, arguments, void 0, function* (model, where = {}, include = []) {
            try {
                // Filter out undefined values from where clause
                const filteredWhere = Object.entries(where).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== null) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                const options = {
                    include,
                };
                // Only add where clause if there are conditions
                if (Object.keys(filteredWhere).length > 0) {
                    options.where = filteredWhere;
                }
                return yield model.findAll(options);
            }
            catch (err) {
                index_1.logger.error("Error in getAll:", err);
                throw err;
            }
        });
    }
    RecordExists(model, where) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const record = yield model.findOne({ where });
                return record ? record : false;
            }
            catch (err) {
                index_1.logger.error("Error in recordExists:", err);
                throw err;
            }
        });
    }
    getVersions(vendor, product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {};
                let VendorId = vendor
                    ? yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } })
                    : null;
                let ProductId = product
                    ? yield Schemes_1.Product.findOne({
                        where: {
                            ProductName: product,
                            VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                        },
                    })
                    : null;
                if (vendor)
                    where.VendorId = VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId");
                if (product)
                    where.ProductId = ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId");
                let versions = yield this.getAll(Schemes_1.Version, where, [
                    {
                        model: Schemes_1.Product,
                        attributes: ["ProductName"],
                    },
                    {
                        model: Schemes_1.Vendor,
                        attributes: ["VendorName"],
                    },
                ]);
                let versionsdata = versions.map((version) => {
                    return {
                        VersionId: version.VersionId,
                        VersionName: version.VersionName,
                        ProductName: version.Product.ProductName,
                        VendorName: version.Vendor.VendorName,
                        ReleaseDate: version.ReleaseDate ? version.ReleaseDate : undefined,
                        EndOfSupportDate: version.EndOfSupportDate
                            ? version.EndOfSupportDate
                            : undefined,
                        LevelOfSupport: version.LevelOfSupport
                            ? version.LevelOfSupport
                            : undefined,
                        ExtendedSupportEndDate: version.ExtendedSupportEndDate
                            ? version.ExtendedSupportEndDate
                            : undefined,
                        EoslStartDate: version.EoslStartDate
                            ? version.EoslStartDate
                            : undefined,
                        FullReleaseNotes: version.FullReleaseNotes
                            ? version.FullReleaseNotes
                            : undefined,
                        Timestamp: version.Timestamp ? version.Timestamp : undefined,
                    };
                });
                return versionsdata;
            }
            catch (error) {
                index_1.logger.error("Error in getVersions", error);
                throw error;
            }
        });
    }
    getProducts(vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {};
                let VendorId = vendor
                    ? yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } })
                    : null;
                if (vendor)
                    where.VendorId = VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId");
                let products = yield this.getAll(Schemes_1.Product, where, [
                    {
                        model: Schemes_1.Vendor,
                        attributes: ["VendorName", "VendorId"],
                    },
                ]);
                let productsdata = products.map((product) => {
                    return {
                        ProductName: product.ProductName,
                        VendorName: product.Vendor.VendorName,
                        ProductId: product.ProductId,
                        VendorId: product.VendorId,
                        JSON_URL: product.JSON_URL,
                        ReleaseNotes: product.ReleaseNotes ? product.ReleaseNotes : undefined,
                    };
                });
                return productsdata;
            }
            catch (error) {
                index_1.logger.error("Error in getProducts", error);
                throw error;
            }
        });
    }
    getModules(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let VendorId = yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } });
                let ProductId = yield Schemes_1.Product.findOne({
                    where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId") },
                });
                let modules = yield this.getAll(Schemes_1.Module, {
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                }, [
                    {
                        model: Schemes_1.Vendor,
                        attributes: ["VendorName", "VendorId"],
                    },
                    {
                        model: Schemes_1.Product,
                        attributes: ["ProductName", "ProductId"],
                    },
                ]);
                let modulesdata = modules.map((module) => {
                    return {
                        ModuleName: module.ModuleName,
                        ProductName: module.Product.ProductName,
                        VendorName: module.Vendor.VendorName,
                    };
                });
                return modulesdata;
            }
            catch (error) {
                index_1.logger.error("Error in getModules", error);
                throw error;
            }
        });
    }
    getIssues(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let VendorId = yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } });
                let ProductId = yield Schemes_1.Product.findOne({
                    where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId") },
                });
                let issues = yield this.getAll(Schemes_1.Issue, {
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                }, [
                    {
                        model: Schemes_1.Product,
                        attributes: ["ProductName", "ProductId"],
                    },
                    {
                        model: Schemes_1.Vendor,
                        attributes: ["VendorName"],
                    },
                    {
                        model: Schemes_1.Version,
                        attributes: ["VersionName", "VersionId"],
                    },
                ]);
                let issuesdata = issues.map((issue) => {
                    return {
                        Issue: issue.Issue,
                        IssueId: issue.IssueId,
                        VersionId: issue.VersionId,
                        ModuleId: issue.ModuleId,
                        VersionName: issue.Version.VersionName,
                        Email: issue.Email,
                        Rule: issue.Rule ? issue.Rule : undefined,
                        Severity: issue.Severity ? issue.Severity : undefined,
                        DateField: issue.DateField,
                        UserID: issue.UserID,
                        Ratification: issue.Ratification,
                        Workaround: issue.Workaround ? issue.Workaround : undefined,
                        Resolution: issue.Resolution ? issue.Resolution : undefined,
                    };
                });
                return issuesdata;
            }
            catch (error) {
                index_1.logger.error("Error in getIssues", error);
                throw error;
            }
        });
    }
    CheckUserExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.RecordExists(Schemes_1.User, {
                email,
            });
            return user ? user.id : false;
        });
    }
    GetUsersArray(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            let VendorId = yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } });
            let ProductId = yield Schemes_1.Product.findOne({
                where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId") },
            });
            const userProducts = yield this.getAll(Schemes_1.UserChosenProduct, {
                ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
            }, [
                {
                    model: Schemes_1.User,
                    attributes: ["email"],
                },
            ]);
            return userProducts.map((userProduct) => ({
                Email: userProduct.User.email,
                LastUpdate: userProduct.LastUpdate,
                UnitOfTime: userProduct.UnitOfTime,
                Frequency: userProduct.Frequency,
                UserID: userProduct.UserID,
                ProductId: userProduct.ProductId,
                VendorId: userProduct.VendorId,
            }));
        });
    }
    subscribe(userid, product, vendor, Unit_of_time, Frequency) {
        return __awaiter(this, void 0, void 0, function* () {
            const VendorId = yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } });
            const ProductId = yield Schemes_1.Product.findOne({
                where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId") },
            });
            return new Promise((resolve, reject) => {
                try {
                    Schemes_1.UserChosenProduct.count({
                        where: {
                            UserID: userid,
                            ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                        },
                    })
                        .then((count) => {
                        if (count > 0) {
                            Schemes_1.UserChosenProduct.update({
                                UnitOfTime: Unit_of_time,
                                Frequency: Frequency,
                            }, {
                                where: {
                                    UserID: userid,
                                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                                },
                            })
                                .then(() => {
                                resolve(true);
                            })
                                .catch((err) => {
                                index_1.logger.error("Error updating subscription:", err);
                                reject({ error: "Database error", details: err });
                            });
                        }
                        else {
                            Schemes_1.UserChosenProduct.create({
                                UserID: userid,
                                ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                                VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                                UnitOfTime: Unit_of_time,
                                Frequency: Frequency,
                                LastUpdate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                            })
                                .then(() => {
                                resolve({ success: true, message: "Subscription added" });
                            })
                                .catch((err) => {
                                index_1.logger.error("Error inserting subscription:", err);
                                reject({ error: "Database error", details: err });
                            });
                        }
                    })
                        .catch((err) => {
                        index_1.logger.error("Error checking for existing subscription:", err);
                        reject({ error: "Database error", details: err });
                    });
                }
                catch (err) {
                    reject(false);
                }
            });
        });
    }
    registerUser(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    Schemes_1.User.create({
                        email,
                        role,
                    })
                        .then(() => {
                        index_1.logger.info("User registered successfully- " + email);
                        resolve(true);
                    })
                        .catch((err) => {
                        index_1.logger.error("Error registering user- " + email, err.message);
                        reject(false);
                    });
                }
                catch (err) {
                    reject(false);
                }
            });
        });
    }
    report(vendor, product, version, module, email, severity, issueDescription, userid, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            let VendorId = yield Schemes_1.Vendor.findOne({ where: { VendorName: vendor } });
            let ProductId = yield Schemes_1.Product.findOne({
                where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId") },
            });
            let VersionId = yield Schemes_1.Version.findOne({
                where: { VersionName: version, ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId") },
            });
            let ModuleId = yield Schemes_1.Module.findOne({
                where: {
                    ModuleName: module,
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                },
            });
            return new Promise((resolve, reject) => {
                Schemes_1.Issue.create({
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.get("VendorId"),
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.get("ProductId"),
                    VersionId: VersionId === null || VersionId === void 0 ? void 0 : VersionId.get("VersionId"),
                    ModuleId: ModuleId === null || ModuleId === void 0 ? void 0 : ModuleId.get("ModuleId"),
                    Email: email,
                    Rule: rule,
                    Severity: severity,
                    Issue: issueDescription,
                    DateField: new Date().toISOString(),
                    UserID: userid,
                    Ratification: 1,
                })
                    .then((issue) => {
                    resolve(issue.IssueId);
                })
                    .catch((err) => {
                    console.error("Error reporting issue", err.message);
                    reject(false);
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.sequelize
                    .close()
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            });
        });
    }
    // New method to process test notifications
    processTestNotifications(email, productToNotify, unitOfTime, interval, vendortoNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                index_1.logger.info(`Processing test notification for ${email} with products: ${productToNotify}, vendor: ${vendortoNotify}`);
                // Collection to store versions that need test EOL notifications
                let testVersionsToNotify = [];
                let products = [];
                if (productToNotify === 'All Products' && vendortoNotify === 'All Vendors') {
                    // Get all products from all vendors
                    products = yield this.getProducts();
                }
                else if (productToNotify === 'All Products' && vendortoNotify !== 'All Vendors') {
                    // Get all products from a specific vendor
                    products = yield this.getProducts(vendortoNotify);
                }
                else {
                    // Specific product from specific vendor
                    const specificProducts = yield this.getProducts(vendortoNotify);
                    products = specificProducts.filter(p => p.ProductName === productToNotify);
                }
                if (products.length === 0) {
                    index_1.logger.warn(`No products found matching criteria: product=${productToNotify}, vendor=${vendortoNotify}`);
                    return {
                        success: false,
                        message: `No products found matching criteria: product=${productToNotify}, vendor=${vendortoNotify}`
                    };
                }
                // For each product in the filtered list
                for (const testProduct of products) {
                    // Get versions for this product
                    const versions = yield this.getVersions(testProduct.VendorName, testProduct.ProductName);
                    if (!versions || versions.length === 0) {
                        index_1.logger.warn(`No versions found for ${testProduct.ProductName} (${testProduct.VendorName})`);
                        continue;
                    }
                    for (const version of versions) {
                        const endOfSupportDate = version.EndOfSupportDate;
                        const extendedEndOfSupportDate = version.ExtendedSupportEndDate;
                        // Skip versions without EOS date
                        if (!endOfSupportDate) {
                            continue;
                        }
                        // Calculate days until EOS
                        const daysUntilEOS = Math.ceil((endOfSupportDate.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24));
                        // Calculate days until extended EOS if available
                        let daysUntilExtendedEOS;
                        if (extendedEndOfSupportDate) {
                            daysUntilExtendedEOS = Math.ceil((extendedEndOfSupportDate.getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24));
                        }
                        // Create a fake user for the test
                        const testUser = {
                            Email: email,
                            LastUpdate: new Date(0), // Very old date to ensure notification will be sent
                            UnitOfTime: unitOfTime,
                            Frequency: interval.toString(),
                            UserID: -1, // Special ID for test users
                            ProductId: testProduct.ProductId,
                            VendorId: testProduct.VendorId
                        };
                        // Create version data
                        const versionData = {
                            VersionName: version.VersionName,
                            ProductName: testProduct.ProductName,
                            VendorName: testProduct.VendorName,
                            ReleaseDate: version.ReleaseDate,
                            EndOfSupportDate: endOfSupportDate,
                            LevelOfSupport: version.LevelOfSupport,
                            ExtendedSupportEndDate: extendedEndOfSupportDate,
                            EoslStartDate: version.EoslStartDate, // Use directly from version
                            FullReleaseNotes: version.FullReleaseNotes // Use directly from version
                        };
                        // Add to test notifications
                        testVersionsToNotify.push({
                            versionData,
                            daysUntilEOS,
                            daysUntilExtendedEOS,
                            users: [testUser],
                            frequency: `${unitOfTime}_${interval}`
                        });
                    }
                }
                if (testVersionsToNotify.length === 0) {
                    index_1.logger.warn('No test notifications to send - no versions with EOS dates found');
                    return {
                        success: false,
                        message: 'No valid versions found for test notification'
                    };
                }
                testVersionsToNotify = testVersionsToNotify.filter(v => (v.daysUntilEOS >= 0 && v.daysUntilEOS <= 30) || (v.daysUntilExtendedEOS ? v.daysUntilExtendedEOS >= 0 && v.daysUntilExtendedEOS <= 14 : false));
                // Process test notifications
                for (const testVersion of testVersionsToNotify) {
                    // Create appropriate email body
                    let emailBody;
                    let shouldSendEmail = false;
                    if (testVersion.daysUntilExtendedEOS && testVersion.daysUntilExtendedEOS <= 14) {
                        shouldSendEmail = true;
                        emailBody = (0, HelperFunctions_1.EmailBodyCreator)(testVersion.users[0].Email, `End of Extended Support Alert: ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName}`, `Hey ${testVersion.users[0].Email}`, `This is a TEST notification. The end of extended support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of extended support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is:`, `${(_a = testVersion.versionData.ExtendedSupportEndDate) === null || _a === void 0 ? void 0 : _a.toDateString()} ,`, `Number of days remaining:`, `${testVersion.daysUntilExtendedEOS}`);
                    }
                    else if (testVersion.daysUntilEOS <= 7) {
                        shouldSendEmail = true;
                        emailBody = (0, HelperFunctions_1.EmailBodyCreator)(testVersion.users[0].Email, `Critical: End of Support Approaching - 7 days or less remaining`, `Hey ${testVersion.users[0].Email}`, `This is a TEST notification. The end of support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is:`, `${(_b = testVersion.versionData.EndOfSupportDate) === null || _b === void 0 ? void 0 : _b.toDateString()} ,`, `Number of days remaining:`, `${testVersion.daysUntilEOS}`);
                    }
                    else if (testVersion.daysUntilEOS <= 30) {
                        shouldSendEmail = true;
                        emailBody = (0, HelperFunctions_1.EmailBodyCreator)(testVersion.users[0].Email, `End of Support Alert: ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName}`, `Hey ${testVersion.users[0].Email}`, `This is a TEST notification. The end of support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is approaching.`, `End of Support Date:`, `The end of support date for ${testVersion.versionData.ProductName.replace(/_/g, ' ')} ${testVersion.versionData.VersionName} is:`, `${(_c = testVersion.versionData.EndOfSupportDate) === null || _c === void 0 ? void 0 : _c.toDateString()} ,`, `Number of days remaining:`, `${testVersion.daysUntilEOS}`);
                    }
                    if (shouldSendEmail) {
                        // Send the email directly
                        yield (0, LogicFunctions_3.sendEosEmail)(testVersion.users, testVersion.frequency, emailBody, testVersion);
                    }
                }
                index_1.logger.info(`Successfully sent ${testVersionsToNotify.length} test notifications to ${email}`);
                return {
                    success: true,
                    message: `Sent ${testVersionsToNotify.length} test notifications to ${email}`,
                    notifiedProducts: testVersionsToNotify.map(v => ({
                        product: v.versionData.ProductName,
                        version: v.versionData.VersionName,
                        daysUntilEOS: v.daysUntilEOS
                    }))
                };
            }
            catch (error) {
                index_1.logger.error('Error processing test notifications:', error);
                return { success: false, error };
            }
        });
    }
}
exports.default = Database;
