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
exports.Database = void 0;
const axios_1 = __importDefault(require("axios"));
const LogicFunctions_1 = require("../Functions/LogicFunctions");
const LogicFunctions_2 = require("../Functions/LogicFunctions");
const Data = require('../../../Data.json');
const index_1 = require("../index");
const LogicFunctions_3 = require("../Functions/LogicFunctions");
const ORM_1 = require("./ORM");
const ORM_2 = require("./ORM");
class Database {
    constructor() {
        this.sequelize = ORM_2.sequelize;
    }
    HandleData() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let listoffortraversions = yield (0, LogicFunctions_1.extract_fortra_versions_to_json)(Data.Vendors[1].JSON_URL);
            try {
                for (const vendor of Data.Vendors) {
                    yield ORM_1.Vendor.findOrCreate({
                        where: { VendorName: vendor.VendorName },
                        defaults: {
                            ContactInfo: vendor.contactInfo,
                            WebsiteUrl: vendor.WebsiteUrl
                        }
                    });
                    for (const product of vendor.Products) {
                        let productRecord = yield ORM_1.Product.findOrCreate({
                            where: {
                                ProductName: product.ProductName,
                                VendorId: vendor.VendorId
                            },
                            defaults: {
                                JSON_URL: product.JSON_URL,
                                ReleaseNotes: product.release_notes
                            }
                        });
                        if (product.modules) {
                            for (const module of product.modules) {
                                yield ORM_1.Module.findOrCreate({
                                    where: { ModuleName: module, ProductId: productRecord[0].ProductId, VendorId: vendor.VendorId },
                                    defaults: { ModuleName: module }
                                });
                            }
                        }
                        let listofversions = [];
                        if (vendor.VendorName === 'Fortra') {
                            listofversions = yield (0, LogicFunctions_3.extract_fortra_versions)(product.ProductName, listoffortraversions);
                        }
                        else {
                            if (product.BASE_URL) {
                                try {
                                    const ids = yield (0, LogicFunctions_1.extract_Opswat_Key_Indexes)(product.JSON_URL);
                                    console.log('id', ids);
                                    const merged_listofversions = [];
                                    for (const index of ids) {
                                        const jsonRequest = product.BASE_URL + index;
                                        let listofversionstemp = yield axios_1.default.get(jsonRequest);
                                        listofversionstemp = (0, LogicFunctions_1.extract_versions_from_json)(listofversionstemp, vendor.VendorName, product.ProductName);
                                        merged_listofversions.push(...listofversionstemp);
                                    }
                                    listofversions = merged_listofversions;
                                }
                                catch (error) {
                                    index_1.logger.error('Error fetching data:', error);
                                    throw error;
                                }
                            }
                            else {
                                listofversions = yield axios_1.default.get(product.JSON_URL);
                                listofversions = (0, LogicFunctions_1.extract_versions_from_json)(listofversions, vendor.VendorName, product.ProductName);
                            }
                        }
                        //let us know how new is the version (the smaller the index the newer the version)
                        let ProductVersionIndex = 0;
                        for (const version of listofversions) {
                            let UsersArray = yield this.GetUsersArray(product.ProductName, vendor.VendorName);
                            let VersionNameExtracted = version[0];
                            let ReleaseDate_DateTime = (0, LogicFunctions_2.parseDate)(version[1]);
                            let EndOfSupportDate_DateTime = (0, LogicFunctions_2.parseDate)(version[2]);
                            let LevelOfSupport = version[3];
                            let ExtendedEndOfSupportDate = (0, LogicFunctions_2.parseDate)(version[4]);
                            let EOSL_Start_Date = (0, LogicFunctions_2.parseDate)(version[5]);
                            let release_notes;
                            if (vendor.VendorName === 'OPSWAT') {
                                if (ProductVersionIndex !== 0) {
                                    if (product.ProductName === 'Metadefender_Core') {
                                        release_notes = product.release_notes + '/archived-release-notes#version-v' +
                                            VersionNameExtracted.replace(/Version |[Vv]|\./g, '');
                                    }
                                    else {
                                        release_notes = product.archive_release_notes;
                                    }
                                }
                                else {
                                    release_notes = product.release_notes;
                                }
                            }
                            else if (vendor.VendorName === 'Fortra') {
                                release_notes = product.release_notes;
                            }
                            const VersionData = {
                                VersionName: VersionNameExtracted,
                                ProductName: product.ProductName,
                                VendorName: vendor.VendorName,
                                ReleaseDate: ReleaseDate_DateTime ? ReleaseDate_DateTime : undefined,
                                EndOfSupportDate: EndOfSupportDate_DateTime ? EndOfSupportDate_DateTime : undefined,
                                LevelOfSupport: LevelOfSupport ? LevelOfSupport : undefined,
                                ExtendedSupportEndDate: ExtendedEndOfSupportDate ? ExtendedEndOfSupportDate : undefined,
                                EoslStartDate: EOSL_Start_Date ? EOSL_Start_Date : undefined,
                                FullReleaseNotes: release_notes
                            };
                            const [versionRecord, created] = yield ORM_1.Version.findOrCreate({
                                where: {
                                    VersionName: VersionData.VersionName,
                                },
                                include: [{
                                        model: ORM_1.Product,
                                        attributes: ['ProductId'],
                                        where: {
                                            ProductName: VersionData.ProductName,
                                        }
                                    },
                                    {
                                        model: ORM_1.Vendor,
                                        attributes: ['VendorId'],
                                        where: {
                                            VendorName: vendor.VendorName
                                        }
                                    }
                                ],
                                defaults: {
                                    ProductId: ((_a = (yield ORM_1.Product.findOne({
                                        where: {
                                            ProductName: VersionData.ProductName,
                                            VendorId: vendor.VendorId
                                        }
                                    }))) === null || _a === void 0 ? void 0 : _a.ProductId) || null,
                                    VendorId: ((_b = (yield ORM_1.Vendor.findOne({
                                        where: {
                                            VendorName: vendor.VendorName
                                        }
                                    }))) === null || _b === void 0 ? void 0 : _b.VendorId) || null,
                                    ReleaseDate: VersionData.ReleaseDate,
                                    EndOfSupportDate: VersionData.EndOfSupportDate,
                                    LevelOfSupport: VersionData.LevelOfSupport,
                                    ExtendedSupportEndDate: VersionData.ExtendedSupportEndDate,
                                    EoslStartDate: VersionData.EoslStartDate,
                                    FullReleaseNotes: VersionData.FullReleaseNotes,
                                    Timestamp: new Date()
                                }
                            });
                            if (!created) {
                                if (((_c = versionRecord.EndOfSupportDate) === null || _c === void 0 ? void 0 : _c.getTime()) !== (EndOfSupportDate_DateTime === null || EndOfSupportDate_DateTime === void 0 ? void 0 : EndOfSupportDate_DateTime.getTime())) {
                                    yield versionRecord.update({
                                        EndOfSupportDate: EndOfSupportDate_DateTime
                                    });
                                    yield (0, LogicFunctions_1.notify_on_end_of_support_changes)(product.ProductName, vendor.VendorName, VersionData.VersionName, versionRecord.EndOfSupportDate, EndOfSupportDate_DateTime, UsersArray);
                                }
                            }
                            else {
                                yield (0, LogicFunctions_1.notify_new_version)(VersionData, UsersArray);
                            }
                            if (EndOfSupportDate_DateTime) {
                                let daysUntilExtendedEOS;
                                const daysUntilEOS = Math.ceil((EndOfSupportDate_DateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (ExtendedEndOfSupportDate) {
                                    daysUntilExtendedEOS = Math.ceil((ExtendedEndOfSupportDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                }
                                if ((daysUntilEOS <= 30 && daysUntilEOS >= 0) || daysUntilExtendedEOS && daysUntilExtendedEOS < 14) {
                                    (0, LogicFunctions_1.notify_on_end_of_support)(VersionData, daysUntilEOS, daysUntilExtendedEOS && daysUntilExtendedEOS, UsersArray);
                                }
                            }
                            ProductVersionIndex++;
                        }
                    }
                }
                index_1.logger.info('Successfully completed version check');
                return true;
            }
            catch (error) {
                index_1.logger.error('Error in HandleData', error);
                return error;
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
                const model = ORM_2.sequelize.models[table];
                const [affectedCount] = yield model.update(updateValues, {
                    where: whereConditions
                });
                return affectedCount > 0;
            }
            catch (err) {
                index_1.logger.error('Error in UpdateRecord:', err);
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
                    include
                };
                // Only add where clause if there are conditions
                if (Object.keys(filteredWhere).length > 0) {
                    options.where = filteredWhere;
                }
                return yield model.findAll(options);
            }
            catch (err) {
                index_1.logger.error('Error in getAll:', err);
                throw err;
            }
        });
    }
    recordExists(model, where) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const record = yield model.findOne({ where });
                return record ? record : false;
            }
            catch (err) {
                index_1.logger.error('Error in recordExists:', err);
                throw err;
            }
        });
    }
    getVersions(vendor, product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {};
                let VendorId = vendor ? yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } }) : null;
                let ProductId = product ? yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } }) : null;
                if (vendor)
                    where.VendorId = VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId;
                if (product)
                    where.ProductId = ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId;
                let versions = yield this.getAll(ORM_1.Version, where, [
                    {
                        model: ORM_1.Product,
                        attributes: ['ProductName']
                    },
                    {
                        model: ORM_1.Vendor,
                        attributes: ['VendorName']
                    }
                ]);
                let versionsdata = versions.map((version) => {
                    return {
                        VersionId: version.VersionId,
                        VersionName: version.VersionName,
                        ProductName: version.Product.ProductName,
                        VendorName: version.Vendor.VendorName,
                        ReleaseDate: version.ReleaseDate ? version.ReleaseDate : undefined,
                        EndOfSupportDate: version.EndOfSupportDate ? version.EndOfSupportDate : undefined,
                        LevelOfSupport: version.LevelOfSupport ? version.LevelOfSupport : undefined,
                        ExtendedSupportEndDate: version.ExtendedSupportEndDate ? version.ExtendedSupportEndDate : undefined,
                        EoslStartDate: version.EoslStartDate ? version.EoslStartDate : undefined,
                        FullReleaseNotes: version.FullReleaseNotes ? version.FullReleaseNotes : undefined,
                        Timestamp: version.Timestamp ? version.Timestamp : undefined
                    };
                });
                return versionsdata;
            }
            catch (error) {
                index_1.logger.error('Error in getVersions', error);
                throw error;
            }
        });
    }
    getProducts(vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {};
                let VendorId = vendor ? yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } }) : null;
                if (vendor)
                    where.VendorId = VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId;
                let products = yield this.getAll(ORM_1.Product, where, [{
                        model: ORM_1.Vendor,
                        attributes: ['VendorName', 'VendorId']
                    }]);
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
                console.log('productsdata', productsdata);
                return productsdata;
            }
            catch (error) {
                index_1.logger.error('Error in getProducts', error);
                throw error;
            }
        });
    }
    getModules(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let VendorId = yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } });
                let ProductId = yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
                let modules = yield this.getAll(ORM_1.Module, {
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId
                }, [
                    {
                        model: ORM_1.Vendor,
                        attributes: ['VendorName', 'VendorId']
                    },
                    {
                        model: ORM_1.Product,
                        attributes: ['ProductName', 'ProductId']
                    }
                ]);
                let modulesdata = modules.map((module) => {
                    return {
                        ModuleName: module.ModuleName,
                        ProductName: module.Product.ProductName,
                        VendorName: module.Vendor.VendorName
                    };
                });
                console.log('modulesdata', modulesdata);
                return modulesdata;
            }
            catch (error) {
                index_1.logger.error('Error in getModules', error);
                throw error;
            }
        });
    }
    getIssues(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let VendorId = yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } });
                let ProductId = yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
                let issues = yield this.getAll(ORM_1.Issue, {
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId
                }, [
                    {
                        model: ORM_1.Product,
                        attributes: ['ProductName', 'ProductId']
                    },
                    {
                        model: ORM_1.Vendor,
                        attributes: ['VendorName']
                    },
                    {
                        model: ORM_1.Version,
                        attributes: ['VersionName', 'VersionId']
                    }
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
                        Resolution: issue.Resolution ? issue.Resolution : undefined
                    };
                });
                console.log('issuesdata', issuesdata);
                return issuesdata;
            }
            catch (error) {
                index_1.logger.error('Error in getIssues', error);
                throw error;
            }
        });
    }
    CheckUserExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.recordExists(ORM_1.User, { email });
            return user ? user.id : false;
        });
    }
    GetUsersArray(product, vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            let VendorId = yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } });
            let ProductId = yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
            const userProducts = yield this.getAll(ORM_1.UserChosenProduct, {
                ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId
            }, [{
                    model: ORM_1.User,
                    attributes: ['email']
                }]);
            return userProducts.map(userProduct => ({
                Email: userProduct.User.email,
                LastUpdate: userProduct.LastUpdate,
                UnitOfTime: userProduct.UnitOfTime,
                Frequency: userProduct.Frequency,
                UserID: userProduct.UserID,
                ProductId: userProduct.ProductId,
                VendorId: userProduct.VendorId
            }));
        });
    }
    subscribe(userid, product, vendor, Unit_of_time, Frequency) {
        return __awaiter(this, void 0, void 0, function* () {
            const VendorId = yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } });
            const ProductId = yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
            return new Promise((resolve, reject) => {
                try {
                    ORM_1.UserChosenProduct.count({
                        where: {
                            UserID: userid,
                            ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                        }
                    }).then(count => {
                        if (count > 0) {
                            ORM_1.UserChosenProduct.update({
                                UnitOfTime: Unit_of_time,
                                Frequency: Frequency
                            }, {
                                where: {
                                    UserID: userid,
                                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                                }
                            }).then(() => {
                                resolve(true);
                            }).catch(err => {
                                index_1.logger.error('Error updating subscription:', err);
                                reject({ error: 'Database error', details: err });
                            });
                        }
                        else {
                            ORM_1.UserChosenProduct.create({
                                UserID: userid,
                                ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                                VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId,
                                UnitOfTime: Unit_of_time,
                                Frequency: Frequency,
                                LastUpdate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                            }).then(() => {
                                resolve({ success: true, message: 'Subscription added' });
                            }).catch(err => {
                                index_1.logger.error('Error inserting subscription:', err);
                                reject({ error: 'Database error', details: err });
                            });
                        }
                    }).catch(err => {
                        index_1.logger.error('Error checking for existing subscription:', err);
                        reject({ error: 'Database error', details: err });
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
                    ORM_1.User.create({
                        email,
                        role
                    }).then(() => {
                        console.log('User registered successfully');
                        resolve(true);
                    }).catch(err => {
                        console.error('Error registering user', err.message);
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
            let VendorId = yield ORM_1.Vendor.findOne({ where: { VendorName: vendor } });
            let ProductId = yield ORM_1.Product.findOne({ where: { ProductName: product, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
            let VersionId = yield ORM_1.Version.findOne({ where: { VersionName: version, ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId } });
            let ModuleId = yield ORM_1.Module.findOne({ where: { ModuleName: module, ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId, VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId } });
            return new Promise((resolve, reject) => {
                ORM_1.Issue.create({
                    VendorId: VendorId === null || VendorId === void 0 ? void 0 : VendorId.VendorId,
                    ProductId: ProductId === null || ProductId === void 0 ? void 0 : ProductId.ProductId,
                    VersionId: VersionId === null || VersionId === void 0 ? void 0 : VersionId.VersionId,
                    ModuleId: ModuleId === null || ModuleId === void 0 ? void 0 : ModuleId.ModuleId,
                    Email: email,
                    Rule: rule,
                    Severity: severity,
                    Issue: issueDescription,
                    DateField: new Date().toISOString(),
                    UserID: userid,
                    Ratification: 1
                }).then(issue => {
                    resolve(issue.IssueId);
                }).catch(err => {
                    console.error('Error reporting issue', err.message);
                    reject(false);
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.sequelize.close().then(() => {
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }
}
exports.Database = Database;
