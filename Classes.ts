class Vendor {
    VendorId:number;
    VendorName: string;
    contactInfo: string;
    WebsiteUrl: Text        ;
    Products: Product[];
    
    constructor(name: string, id: number, contactInfo: string, WebsiteUrl: Text, products: Product[]) {
        this.VendorName = name;
        this.VendorId = id;
        this.contactInfo = contactInfo;
        this.WebsiteUrl = WebsiteUrl;
        this.Products = products;
    }

    addProduct(product: Product) {
        this.Products.push(product);
    }
}

class Product {
    ProductId: number;
    ProductName: string;
    Vendor: Vendor;
    Versions: Version[];
    JSON_URL: string;

    constructor(id: number, name: string, vendor: Vendor, versions: Version[], json_url: string) {
        this.ProductId = id;
        this.ProductName = name;
        this.Vendor = vendor;
        this.Versions = versions;
        this.JSON_URL = json_url;
    }

    addVersion(version: Version) {
        this.Versions.push(version);
    }
}

class Version {
    VersionId: number;
    VersionNumber: string;
    Product: Product;
    ReleaseDate: Date;
    EndOfSupportDate: Date; 

    constructor(id: number, number: string, product: Product, endOfSupportDate: Date, releaseDate: Date ) {
        this.VersionId = id;
        this.VersionNumber = number;
        this.Product = product;
        this.EndOfSupportDate = endOfSupportDate;
        this.ReleaseDate = releaseDate;
    }

    isUpToDate(version: Version) {
        return this.VersionNumber === version.VersionNumber;
    }
}

export { Vendor, Product, Version };
