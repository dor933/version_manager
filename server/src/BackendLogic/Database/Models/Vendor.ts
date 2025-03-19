import { DataTypes } from "sequelize";

export const Vendor_Model = {
    VendorId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VendorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ContactInfo: DataTypes.STRING,
    WebsiteUrl: DataTypes.STRING
}; 