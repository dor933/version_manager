import { Sequelize, DataTypes, Model } from 'sequelize';
import { sqlLogger } from '../index';

// Create and export the Sequelize instance

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './my-database.db',
    logging: (msg: string, details?: any) => {
        if (msg.includes('INSERT') || msg.includes('UPDATE')) {
            sqlLogger.info(msg, {
                values: details?.bind || [],
            });
        }
    }
});


// Model definitions
class User extends Model {
    declare id: number;
    declare email: string;
    declare role: string;
}
class UserChosenProduct extends Model {
    declare UserID: number;
    declare ProductId: number;
    declare VendorId: number;
    declare UnitOfTime: string;
    declare Frequency: string;
    declare LastUpdate: Date;
    declare User: User;
}
class Vendor extends Model {
    declare VendorName: string;
    declare ContactInfo: string;
    declare WebsiteUrl: string;
    declare VendorId: number;
}
class Product extends Model {
    declare ProductName: string;
    declare VendorId: number;
    declare JSON_URL: string;
    declare ReleaseNotes: string;
    declare ProductId: number;

}
class Version extends Model {
    declare dataValues: any;
  declare VersionId: number;
  declare VersionName: string;
  declare ProductId: number;
  declare VendorId: number;
  declare ReleaseDate: Date;
  declare EndOfSupportDate: Date;
  declare LevelOfSupport: string;
  declare ExtendedSupportEndDate: Date;
  declare EoslStartDate: Date;
  declare FullReleaseNotes: string;
  declare Timestamp: Date;
}
class Module extends Model {
    declare ModuleId: number;
    declare ModuleName: string;
    declare ProductId: number;
    declare VendorId: number;
}
class Issue extends Model {
    declare IssueId: number;
    declare ModuleId: number;
    declare ProductId: number;
    declare VendorId: number;
    declare VersionId: number;
    declare Rule: string;
    declare Severity: string;
    declare Issue: string;
    declare DateField: Date;
    declare Ratification: number;
    declare Resolution: string;
    declare UserID: number;
    declare Email: string;
    declare Workaround: string;

}

// Initialize models
User.init({
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
}, {
    sequelize,
    modelName: 'User'
});

Vendor.init({
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
}, {
    sequelize,
    modelName: 'Vendor'
});

Product.init({
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
            model: Vendor,
            key: 'VendorId'
        }
    },
    JSON_URL: DataTypes.STRING,
    ReleaseNotes: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Product',
});

Version.init({
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
}, {
    sequelize,
    modelName: 'Version',
    timestamps: false
});

Module.init({
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
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    }
}, {
    sequelize,
    modelName: 'Module'
});


Issue.init({
    IssueId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleId: {
        type: DataTypes.INTEGER,
        references: {
            model: Module,
            key: 'ModuleId'
        }
    },
    ProductId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    },
    VersionId: {
        type: DataTypes.INTEGER,
        references: {
            model: Version,
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
            model: User,
            key: 'id'
        }
    },
    Email: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'email'
        }
    },
    Severity: DataTypes.STRING,
    Workaround: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'Issue'
});

UserChosenProduct.init({
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        references: {
            model: User,
            key: 'id'
        }
    },
    ProductId: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        references: {
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    },
    UnitOfTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Frequency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    LastUpdate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'UserChosenProduct',
});

// Define relationships
UserChosenProduct.belongsTo(User, {
    foreignKey: 'UserID',
    
});
User.hasMany(UserChosenProduct, {
    foreignKey: 'UserID'
});

UserChosenProduct.belongsTo(Product, {
    foreignKey: 'ProductId'
});

User.belongsToMany(Product, { 
    through: UserChosenProduct,
    foreignKey: 'UserID'
});
Product.belongsToMany(User, { 
    through: UserChosenProduct,
    foreignKey: 'ProductId'
});

Module.belongsTo(Product, {
    foreignKey: 'ProductId',
    targetKey: 'ProductId',
    onDelete: 'CASCADE'
});

Module.belongsTo(Vendor, {
    foreignKey: 'VendorId',
    targetKey: 'VendorId',
    onDelete: 'CASCADE'
});

Version.belongsTo(Product, {
    foreignKey: {
        name: 'ProductId',
        allowNull: false
    },
    targetKey: 'ProductId',
    onDelete: 'CASCADE'
});

Version.belongsTo(Vendor, {
    foreignKey: {
        name: 'VendorId',
        allowNull: false
    },
    targetKey: 'VendorId',
    onDelete: 'CASCADE'
});

Product.belongsTo(Vendor, {
    foreignKey: {
        name: 'VendorId',
        allowNull: false
    },
    targetKey: 'VendorId',
    onDelete: 'CASCADE'
});

Product.hasMany(Version, {
    foreignKey: 'ProductId',
    sourceKey: 'ProductId'
});

Vendor.hasMany(Version, {
    foreignKey: 'VendorId',
    sourceKey: 'VendorId'
});

Vendor.hasMany(Product, {
    foreignKey: 'VendorId',
    sourceKey: 'VendorId'
});

Issue.belongsTo(Module, {
    foreignKey: 'ModuleId',
    targetKey: 'ModuleId',
    onDelete: 'CASCADE'
});

Issue.belongsTo(Product, {
    foreignKey: 'ProductId',
    targetKey: 'ProductId',
    onDelete: 'CASCADE'
});

Issue.belongsTo(Vendor, {
    foreignKey: 'VendorId',
    targetKey: 'VendorId',
    onDelete: 'CASCADE'
});

Issue.belongsTo(Version, {
    foreignKey: 'VersionId',
    targetKey: 'VersionId',
    onDelete: 'CASCADE'
});




// Export the sync function with optional force parameter
export async function syncModels(force: boolean = false) {
    try {
        // Only force sync if explicitly requested
        
        if (force) {
            await sequelize.sync({ force: force });
            sqlLogger.info('Database tables dropped and recreated');
        }



    } catch (error) {
        sqlLogger.error('Error syncing database:', error);
        throw error;
    }
}

// Export everything
export { User, UserChosenProduct, Vendor, Product, Version, Module, Issue };
