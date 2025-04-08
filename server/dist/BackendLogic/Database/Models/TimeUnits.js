"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUnits_Model = exports.TimeUnits = void 0;
const sequelize_1 = require("sequelize");
exports.TimeUnits = {
    UnitOfTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Day', 'Week', 'Month']]
        },
        primaryKey: true
    },
    LastUpdate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
};
exports.TimeUnits_Model = exports.TimeUnits;
