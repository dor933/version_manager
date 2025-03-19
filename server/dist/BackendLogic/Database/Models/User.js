"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_Model = void 0;
const sequelize_1 = require("sequelize");
exports.User_Model = {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    role: sequelize_1.DataTypes.STRING
};
