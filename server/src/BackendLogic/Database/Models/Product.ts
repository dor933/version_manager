import { DataTypes } from "sequelize";

export const Product_Model = {
    ProductId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductName: {
        type: DataTypes.STRING,
    },
    VendorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Vendors',
            key: 'VendorId'
        }
    },
    JSON_URL: DataTypes.STRING,
    ReleaseNotes: DataTypes.STRING
}; 