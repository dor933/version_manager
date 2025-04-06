import { Sequelize, DataTypes } from "sequelize";
import { sqlLogger } from "../index";
import { User_Model } from "./Models/User";
import { Vendor_Model } from "./Models/Vendor";
import { Product_Model } from "./Models/Product";
import { Version_Model } from "./Models/Version";
import { Module_Model } from "./Models/Module";
import { Issue_Model } from "./Models/Issue";
import { UserChosenProduct_Model } from "./Models/UserChosenProduct";
// Create and export the Sequelize instance
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./my-database.db",
  logging: (msg: string, details?: any) => {
    if (msg.includes("INSERT") || msg.includes("UPDATE")) {
      sqlLogger.info(msg, {
        values: details?.bind || [],
      });
    }
  },
});

export const User = sequelize.define("User", User_Model);
export const Vendor = sequelize.define("Vendor", Vendor_Model);
export const Product = sequelize.define("Product", Product_Model);
export const Version = sequelize.define("Version", Version_Model, {
  timestamps: false,
});
export const Module = sequelize.define("Module", Module_Model);
export const Issue = sequelize.define("Issue", Issue_Model);
export const UserChosenProduct = sequelize.define(
  "UserChosenProduct",
  UserChosenProduct_Model
);

// Define associations
UserChosenProduct.belongsTo(User, {
  foreignKey: "UserID",
});

User.hasMany(UserChosenProduct, {
  foreignKey: "UserID",
});

UserChosenProduct.belongsTo(Product, {
  foreignKey: "ProductId",
});

User.belongsToMany(Product, {
  through: UserChosenProduct,
  foreignKey: "UserID",
});

Product.belongsToMany(User, {
  through: UserChosenProduct,
  foreignKey: "ProductId",
});

Module.belongsTo(Product, {
  foreignKey: "ProductId",
  targetKey: "ProductId",
  onDelete: "CASCADE",
});

Module.belongsTo(Vendor, {
  foreignKey: "VendorId",
  targetKey: "VendorId",
  onDelete: "CASCADE",
});

Version.belongsTo(Product, {
  foreignKey: {
    name: "ProductId",
    allowNull: false,
  },
  targetKey: "ProductId",
  onDelete: "CASCADE",
});

Version.belongsTo(Vendor, {
  foreignKey: {
    name: "VendorId",
    allowNull: false,
  },
  targetKey: "VendorId",
  onDelete: "CASCADE",
});

Product.belongsTo(Vendor, {
  foreignKey: {
    name: "VendorId",
    allowNull: false,
  },
  targetKey: "VendorId",
  onDelete: "CASCADE",
});

Product.hasMany(Version, {
  foreignKey: "ProductId",
  sourceKey: "ProductId",
});

Vendor.hasMany(Version, {
  foreignKey: "VendorId",
  sourceKey: "VendorId",
});

Vendor.hasMany(Product, {
  foreignKey: "VendorId",
  sourceKey: "VendorId",
});

Issue.belongsTo(Module, {
  foreignKey: "ModuleId",
  targetKey: "ModuleId",
  onDelete: "CASCADE",
});

Issue.belongsTo(Product, {
  foreignKey: "ProductId",
  targetKey: "ProductId",
  onDelete: "CASCADE",
});

Issue.belongsTo(Vendor, {
  foreignKey: "VendorId",
  targetKey: "VendorId",
  onDelete: "CASCADE",
});

Issue.belongsTo(Version, {
  foreignKey: "VersionId",
  targetKey: "VersionId",
  onDelete: "CASCADE",
});

// Export the sync function with optional force parameter
export async function syncModels(force: boolean = false) {
  try {
    // Only force sync if explicitly requested
    if (force) {
      await sequelize.sync({ force: force });
      sqlLogger.info("Database tables dropped and recreated");
    }
  } catch (error) {
    sqlLogger.error("Error syncing database:", error);
    throw error;
  }
}
