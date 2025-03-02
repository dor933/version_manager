"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Issue = exports.Module = exports.Version = exports.Product = exports.Vendor = exports.UserChosenProduct = exports.User = exports.sequelize = void 0;
exports.syncModels = syncModels;
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
// Create and export the Sequelize instance
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './my-database.db',
    logging: (msg, details) => {
        if (msg.includes('INSERT') || msg.includes('UPDATE')) {
            index_1.sqlLogger.info(msg, {
                values: (details === null || details === void 0 ? void 0 : details.bind) || [],
            });
        }
    }
});
// Model definitions
class User extends sequelize_1.Model {
}
exports.User = User;
class UserChosenProduct extends sequelize_1.Model {
}
exports.UserChosenProduct = UserChosenProduct;
class Vendor extends sequelize_1.Model {
}
exports.Vendor = Vendor;
class Product extends sequelize_1.Model {
}
exports.Product = Product;
class Version extends sequelize_1.Model {
}
exports.Version = Version;
class Module extends sequelize_1.Model {
}
exports.Module = Module;
class Issue extends sequelize_1.Model {
}
exports.Issue = Issue;
// Initialize models
User.init({
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
}, {
    sequelize: exports.sequelize,
    modelName: 'User'
});
Vendor.init({
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VendorName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ContactInfo: sequelize_1.DataTypes.STRING,
    WebsiteUrl: sequelize_1.DataTypes.STRING
}, {
    sequelize: exports.sequelize,
    modelName: 'Vendor'
});
Product.init({
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductName: {
        type: sequelize_1.DataTypes.STRING,
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    },
    JSON_URL: sequelize_1.DataTypes.STRING,
    ReleaseNotes: sequelize_1.DataTypes.STRING
}, {
    sequelize: exports.sequelize,
    modelName: 'Product',
});
Version.init({
    VersionId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    VersionName: {
        type: sequelize_1.DataTypes.STRING,
        field: 'VersionName',
        allowNull: false
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'ProductId'
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'VendorId'
    },
    ReleaseDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'ReleaseDate'
    },
    EndOfSupportDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'EndOfSupportDate'
    },
    LevelOfSupport: {
        type: sequelize_1.DataTypes.STRING,
        field: 'LevelOfSupport'
    },
    ExtendedSupportEndDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'ExtendedSupportEndDate'
    },
    EoslStartDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'EoslStartDate'
    },
    FullReleaseNotes: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'FullReleaseNotes'
    },
    Timestamp: {
        type: sequelize_1.DataTypes.DATE,
        field: 'Timestamp'
    }
}, {
    sequelize: exports.sequelize,
    modelName: 'Version',
    timestamps: false
});
Module.init({
    ModuleId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleName: {
        type: sequelize_1.DataTypes.STRING,
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    }
}, {
    sequelize: exports.sequelize,
    modelName: 'Module'
});
Issue.init({
    IssueId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ModuleId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Module,
            key: 'ModuleId'
        }
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    },
    VersionId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Version,
            key: 'VersionId'
        }
    },
    Issue: sequelize_1.DataTypes.STRING,
    DateField: sequelize_1.DataTypes.DATE,
    Ratification: sequelize_1.DataTypes.INTEGER,
    Resolution: sequelize_1.DataTypes.STRING,
    UserId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    Email: {
        type: sequelize_1.DataTypes.STRING,
        references: {
            model: User,
            key: 'email'
        }
    },
    Severity: sequelize_1.DataTypes.STRING,
    Workaround: sequelize_1.DataTypes.STRING,
}, {
    sequelize: exports.sequelize,
    modelName: 'Issue'
});
UserChosenProduct.init({
    UserID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    ProductId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Product,
            key: 'ProductId'
        }
    },
    VendorId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: Vendor,
            key: 'VendorId'
        }
    },
    UnitOfTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    Frequency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    LastUpdate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: exports.sequelize,
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
function syncModels() {
    return __awaiter(this, arguments, void 0, function* (force = false) {
        try {
            // Only force sync if explicitly requested
            if (force) {
                yield exports.sequelize.sync({ force: force });
                index_1.sqlLogger.info('Database tables dropped and recreated');
            }
        }
        catch (error) {
            index_1.sqlLogger.error('Error syncing database:', error);
            throw error;
        }
    });
}
