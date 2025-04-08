import { DataTypes } from "sequelize";

export const UserChosenProduct_Model = {
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    ProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
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
    },
    UnitOfTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
   
    
}; 