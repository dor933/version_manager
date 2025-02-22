import { Sequelize, DataTypes, Model } from 'sequelize';
import { sqlLogger } from '../index';

// Create and export the Sequelize instance
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './my-database.db',
    logging: (msg: string) => sqlLogger.info(msg)
});

// Model definitions
class User extends Model {
    declare id: number;
    declare email: string;
    declare role: string;
}
class UserChosenProduct extends Model {
    declare UserID: number;
    declare ProductName: string;
    declare VendorName: string;
    declare Unit_of_time: string;
    declare Frequency: string;
    declare Last_Update: Date;
    declare User: User;
}
class Vendor extends Model {
    declare vendorName: string;
    declare contactInfo: string;
    declare websiteUrl: string;
}
class Product extends Model {
    declare productName: string;
    declare vendorName: string;
    declare jsonUrl: string;
    declare releaseNotes: string;

}
class Version extends Model {
  declare versionName: string;
  declare productName: string;
  declare vendorName: string;
  declare releaseDate: Date;
  declare endOfSupportDate: Date;
  declare levelOfSupport: string;
  declare extendedSupportEndDate: Date;
  declare eoslStartDate: Date;
  declare fullReleaseNotes: string;
  declare timestamp: Date;
}
class Module extends Model {
    declare moduleName: string;
    declare productName: string;
    declare vendorName: string;
}
class Issue extends Model {
    declare issueId: number;
    declare moduleName: string;
    declare productName: string;
    declare vendorName: string;
    declare versionName: string;
    declare rule: string;
    declare severity: string;
    declare issue: string;
    declare Date_Field: Date;
    declare ratification: number;
    declare resolution: string;
    declare userId: number;
    declare email: string;
    declare workaround: string;

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
    vendorName: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    contactInfo: DataTypes.STRING,
    websiteUrl: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Vendor'
});

Product.init({
    productName: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    vendorName: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: Vendor,
            key: 'vendorName'
        }
    },
    jsonUrl: DataTypes.STRING,
    releaseNotes: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Product'
});

Version.init({
    versionName: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    productName: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'productName'
        }
    },
    vendorName: {
        type: DataTypes.STRING,
        references: {
            model: Vendor,
            key: 'vendorName'
        }
    },
    releaseDate: DataTypes.DATE,
    endOfSupportDate: DataTypes.DATE,
    levelOfSupport: DataTypes.STRING,
    extendedSupportEndDate: DataTypes.DATE,
    eoslStartDate: DataTypes.DATE,
    fullReleaseNotes: DataTypes.TEXT,
    timestamp: DataTypes.DATE
}, {
    sequelize,
    modelName: 'Version'
});

Module.init({
    ModuleName: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    ProductName: {
        type: DataTypes.STRING, 
        references: {
            model: Product,
            key: 'productName'
        }
    },
    VendorName: {
        type: DataTypes.STRING,
        references: {
            model: Vendor,
            key: 'vendorName'
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
    ModuleName: {
        type: DataTypes.STRING,
        references: {
            model: Module,
            key: 'ModuleName'
        }
    },
    ProductName: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'productName'
        }
    },
    VendorName: {
        type: DataTypes.STRING,
        references: {
            model: Vendor,
            key: 'vendorName'
        }
    },
    VersionName: {
        type: DataTypes.STRING,
        references: {
            model: Version,
            key: 'versionName'
        }
    },
    Issue: DataTypes.STRING,
    Date_field: DataTypes.DATE,
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
        references: {
            model: User,
            key: 'id'
        }
    },
    ProductName: {
        type: DataTypes.STRING,
        references: {
            model: Product,
            key: 'productName'
        }
    },
    VendorName: {
        type: DataTypes.STRING,
        references: {
            model: Vendor,
            key: 'vendorName'
        }
    },
    Unit_of_time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Frequency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Last_Update: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'UserChosenProduct'
});

// Define relationships
UserChosenProduct.belongsTo(User, {
    foreignKey: 'UserID',
    
});
User.hasMany(UserChosenProduct, {
    foreignKey: 'UserID'
});

UserChosenProduct.belongsTo(Product, {
    foreignKey: 'ProductName'
});

User.belongsToMany(Product, { 
    through: UserChosenProduct,
    foreignKey: 'UserID'
});
Product.belongsToMany(User, { 
    through: UserChosenProduct,
    foreignKey: 'ProductName'
});

// Export everything
export { User, UserChosenProduct, Vendor, Product, Version, Module, Issue };
