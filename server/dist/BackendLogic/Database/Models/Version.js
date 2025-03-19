"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version_Model = void 0;
const sequelize_1 = require("sequelize");
exports.Version_Model = {
    VersionId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VersionName: {
        type: sequelize_1.DataTypes.STRING,
        field: 'VersionName',
        allowNull: false
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'ProductId'
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'VendorId'
    },
    ReleaseDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'ReleaseDate'
    },
    EndOfSupportDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'EndOfSupportDate'
    },
    LevelOfSupport: {
        type: sequelize_1.DataTypes.STRING,
        field: 'LevelOfSupport'
    },
    ExtendedSupportEndDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'ExtendedSupportEndDate'
    },
    EoslStartDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'EoslStartDate'
    },
    FullReleaseNotes: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'FullReleaseNotes'
    },
    Timestamp: {
        type: sequelize_1.DataTypes.DATE,
        field: 'Timestamp'
    }
};
