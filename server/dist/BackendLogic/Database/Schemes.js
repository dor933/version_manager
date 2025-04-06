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
exports.UserChosenProduct = exports.Issue = exports.Module = exports.Version = exports.Product = exports.Vendor = exports.User = exports.sequelize = void 0;
exports.syncModels = syncModels;
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
const User_1 = require("./Models/User");
const Vendor_1 = require("./Models/Vendor");
const Product_1 = require("./Models/Product");
const Version_1 = require("./Models/Version");
const Module_1 = require("./Models/Module");
const Issue_1 = require("./Models/Issue");
const UserChosenProduct_1 = require("./Models/UserChosenProduct");
// Create and export the Sequelize instance
exports.sequelize = new sequelize_1.Sequelize({
    dialect: "sqlite",
    storage: "./my-database.db",
    logging: (msg, details) => {
        if (msg.includes("INSERT") || msg.includes("UPDATE")) {
            index_1.sqlLogger.info(msg, {
                values: (details === null || details === void 0 ? void 0 : details.bind) || [],
            });
        }
    },
});
exports.User = exports.sequelize.define("User", User_1.User_Model);
exports.Vendor = exports.sequelize.define("Vendor", Vendor_1.Vendor_Model);
exports.Product = exports.sequelize.define("Product", Product_1.Product_Model);
exports.Version = exports.sequelize.define("Version", Version_1.Version_Model, {
    timestamps: false,
});
exports.Module = exports.sequelize.define("Module", Module_1.Module_Model);
exports.Issue = exports.sequelize.define("Issue", Issue_1.Issue_Model);
exports.UserChosenProduct = exports.sequelize.define("UserChosenProduct", UserChosenProduct_1.UserChosenProduct_Model);
// Define associations
exports.UserChosenProduct.belongsTo(exports.User, {
    foreignKey: "UserID",
});
exports.User.hasMany(exports.UserChosenProduct, {
    foreignKey: "UserID",
});
exports.UserChosenProduct.belongsTo(exports.Product, {
    foreignKey: "ProductId",
});
exports.User.belongsToMany(exports.Product, {
    through: exports.UserChosenProduct,
    foreignKey: "UserID",
});
exports.Product.belongsToMany(exports.User, {
    through: exports.UserChosenProduct,
    foreignKey: "ProductId",
});
exports.Module.belongsTo(exports.Product, {
    foreignKey: "ProductId",
    targetKey: "ProductId",
    onDelete: "CASCADE",
});
exports.Module.belongsTo(exports.Vendor, {
    foreignKey: "VendorId",
    targetKey: "VendorId",
    onDelete: "CASCADE",
});
exports.Version.belongsTo(exports.Product, {
    foreignKey: {
        name: "ProductId",
        allowNull: false,
    },
    targetKey: "ProductId",
    onDelete: "CASCADE",
});
exports.Version.belongsTo(exports.Vendor, {
    foreignKey: {
        name: "VendorId",
        allowNull: false,
    },
    targetKey: "VendorId",
    onDelete: "CASCADE",
});
exports.Product.belongsTo(exports.Vendor, {
    foreignKey: {
        name: "VendorId",
        allowNull: false,
    },
    targetKey: "VendorId",
    onDelete: "CASCADE",
});
exports.Product.hasMany(exports.Version, {
    foreignKey: "ProductId",
    sourceKey: "ProductId",
});
exports.Vendor.hasMany(exports.Version, {
    foreignKey: "VendorId",
    sourceKey: "VendorId",
});
exports.Vendor.hasMany(exports.Product, {
    foreignKey: "VendorId",
    sourceKey: "VendorId",
});
exports.Issue.belongsTo(exports.Module, {
    foreignKey: "ModuleId",
    targetKey: "ModuleId",
    onDelete: "CASCADE",
});
exports.Issue.belongsTo(exports.Product, {
    foreignKey: "ProductId",
    targetKey: "ProductId",
    onDelete: "CASCADE",
});
exports.Issue.belongsTo(exports.Vendor, {
    foreignKey: "VendorId",
    targetKey: "VendorId",
    onDelete: "CASCADE",
});
exports.Issue.belongsTo(exports.Version, {
    foreignKey: "VersionId",
    targetKey: "VersionId",
    onDelete: "CASCADE",
});
// Export the sync function with optional force parameter
function syncModels() {
    return __awaiter(this, arguments, void 0, function* (force = false) {
        try {
            // Only force sync if explicitly requested
            if (force) {
                yield exports.sequelize.sync({ force: force });
                index_1.sqlLogger.info("Database tables dropped and recreated");
            }
        }
        catch (error) {
            index_1.sqlLogger.error("Error syncing database:", error);
            throw error;
        }
    });
}
