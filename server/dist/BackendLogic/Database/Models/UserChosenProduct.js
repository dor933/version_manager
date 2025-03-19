"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChosenProduct_Model = void 0;
const sequelize_1 = require("sequelize");
exports.UserChosenProduct_Model = {
    UserID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
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
    UnitOfTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    Frequency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    LastUpdate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
};
