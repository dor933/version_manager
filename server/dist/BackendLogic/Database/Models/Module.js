"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module_Model = void 0;
const sequelize_1 = require("sequelize");
exports.Module_Model = {
    ModuleId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleName: {
        type: sequelize_1.DataTypes.STRING,
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'ProductId'
        }
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Vendors',
            key: 'VendorId'
        }
    }
};
