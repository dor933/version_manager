export type ProductData = {
    ProductName: string;
    VendorId: number;
    Versions: VersionData[];
    release_notes:string
    JSON_URL?: string;
    BASE_URL?:string;
    modules?:any[]
    issues?:any[],
    archive_release_notes?:string
}

export type VendorData = {
    VendorId: number;
    VendorName: string;
    contactInfo: string;
    WebsiteUrl: string;
    Products: ProductData[];
    JSON_URL?:string
}

export type DataStructure = {
    Vendors: VendorData[];
} 

export type VersionData = {
    VersionName: string;
    ProductName: string;
    VendorName: string;
    ReleaseDate?: Date
    EndOfSupportDate?: Date;
    LevelOfSupport?:string;
    Extended_Support_End_Date?:Date
    EOSL_Start_Date?:Date
    release_notes?:string
    Timestamp?:Date

}
