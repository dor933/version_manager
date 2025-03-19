import { DataTypes } from "sequelize";

export const User_Model={
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    role: DataTypes.STRING
    
}