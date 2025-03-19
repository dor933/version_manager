import { DataTypes } from "sequelize";

export const Version_Model = {
    VersionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VersionName: {
        type: DataTypes.STRING,
        field: 'VersionName',
        allowNull: false
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ProductId'
    },
    VendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VendorId'
    },
    ReleaseDate: {
        type: DataTypes.DATE,
        field: 'ReleaseDate'
    },
    EndOfSupportDate: {
        type: DataTypes.DATE,
        field: 'EndOfSupportDate'
    },
    LevelOfSupport: {
        type: DataTypes.STRING,
        field: 'LevelOfSupport'
    },
    ExtendedSupportEndDate: {
        type: DataTypes.DATE,
        field: 'ExtendedSupportEndDate'
    },
    EoslStartDate: {
        type: DataTypes.DATE,
        field: 'EoslStartDate'
    },
    FullReleaseNotes: {
        type: DataTypes.TEXT,
        field: 'FullReleaseNotes'
    },
    Timestamp: {
        type: DataTypes.DATE,
        field: 'Timestamp'
    }
}; 