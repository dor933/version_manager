export interface ProductData {
    ProductId: number;
    ProductName: string;
    Vendor: VendorData;
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
    ReleaseDate: Date;
    EndOfSupportDate: Date;
}

export interface Array_of_string_or_number {
    [key: string]: string | number;
}

