"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor_Model = void 0;
const sequelize_1 = require("sequelize");
exports.Vendor_Model = {
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VendorName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ContactInfo: sequelize_1.DataTypes.STRING,
    WebsiteUrl: sequelize_1.DataTypes.STRING
};
