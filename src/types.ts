export interface ProductData {
    ProductId: number;
    ProductName: string;
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
    VersionId: number;
    VersionName: string;
    ProductId: number;
    ReleaseDate?: Date
    EndOfSupportDate?: Date;
    ProductName?: string;
    VendorName?: string;
}

