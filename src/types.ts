export interface ProductData {
    ProductName: string;
    VendorId: number;
    Versions: VersionData[];
    JSON_URL: string;
}

export interface VendorData {
    VendorId: number;
    VendorName: string;
    contactInfo: string;
    WebsiteUrl: string;
    Products: ProductData[];
}

export interface DataStructure {
    Vendors: VendorData[];
} 

export interface VersionData {
    VersionName: string;
    ProductName: string;
    VendorName: string;
    ReleaseDate?: Date
    EndOfSupportDate?: Date;
  
}


