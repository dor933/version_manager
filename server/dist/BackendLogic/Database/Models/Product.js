"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product_Model = void 0;
const sequelize_1 = require("sequelize");
exports.Product_Model = {
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductName: {
        type: sequelize_1.DataTypes.STRING,
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Vendors',
            key: 'VendorId'
        }
    },
    JSON_URL: sequelize_1.DataTypes.STRING,
    ReleaseNotes: sequelize_1.DataTypes.STRING
};
