"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = exports.Product = exports.Vendor = void 0;
class Vendor {
    constructor(name, id, contactInfo, WebsiteUrl, products) {
        this.VendorName = name;
        this.VendorId = id;
        this.contactInfo = contactInfo;
        this.WebsiteUrl = WebsiteUrl;
        this.Products = products;
    }
    addProduct(product) {
        this.Products.push(product);
    }
}
exports.Vendor = Vendor;
class Product {
    constructor(id, name, vendor, versions, json_url) {
        this.ProductId = id;
        this.ProductName = name;
        this.Vendor = vendor;
        this.Versions = versions;
        this.JSON_URL = json_url;
    }
    addVersion(version) {
        this.Versions.push(version);
    }
}
exports.Product = Product;
class Version {
    constructor(id, number, product, endOfSupportDate, releaseDate) {
        this.VersionId = id;
        this.VersionNumber = number;
        this.Product = product;
        this.EndOfSupportDate = endOfSupportDate;
        this.ReleaseDate = releaseDate;
    }
    isUpToDate(version) {
        return this.VersionNumber === version.VersionNumber;
    }
}
exports.Version = Version;
