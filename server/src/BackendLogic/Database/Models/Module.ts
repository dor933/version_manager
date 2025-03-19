import { DataTypes } from "sequelize";

export const Module_Model = {
    ModuleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleName: {
        type: DataTypes.STRING,
    },
    ProductId: {
        type: DataTypes.INTEGER, 
        references: {
            model: 'Products',
            key: 'ProductId'
        }
    },
    VendorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Vendors',
            key: 'VendorId'
        }
    }
}; 