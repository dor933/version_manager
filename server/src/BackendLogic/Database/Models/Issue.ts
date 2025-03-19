import { DataTypes } from "sequelize";

export const Issue_Model = {
    IssueId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Modules',
            key: 'ModuleId'
        }
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
    },
    VersionId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Versions',
            key: 'VersionId'
        }
    },
    Issue: DataTypes.STRING,
    DateField: DataTypes.DATE,
    Ratification: DataTypes.INTEGER,
    Resolution: DataTypes.STRING,
    UserId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    Email: {
        type: DataTypes.STRING,
        references: {
            model: 'Users',
            key: 'email'
        }
    },
    Severity: DataTypes.STRING,
    Workaround: DataTypes.STRING,
}; 