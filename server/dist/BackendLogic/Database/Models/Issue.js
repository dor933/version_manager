"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Issue_Model = void 0;
const sequelize_1 = require("sequelize");
exports.Issue_Model = {
    IssueId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Modules',
            key: 'ModuleId'
        }
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
    },
    VersionId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Versions',
            key: 'VersionId'
        }
    },
    Issue: sequelize_1.DataTypes.STRING,
    DateField: sequelize_1.DataTypes.DATE,
    Ratification: sequelize_1.DataTypes.INTEGER,
    Resolution: sequelize_1.DataTypes.STRING,
    UserId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    Email: {
        type: sequelize_1.DataTypes.STRING,
        references: {
            model: 'Users',
            key: 'email'
        }
    },
    Severity: sequelize_1.DataTypes.STRING,
    Workaround: sequelize_1.DataTypes.STRING,
};
