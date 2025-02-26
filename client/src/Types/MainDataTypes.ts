export interface ProductData {
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

export interface VendorData {
    VendorId: number;
    VendorName: string;
    contactInfo: string;
    WebsiteUrl: string;
    Products: ProductData[];
    JSON_URL?:string
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
    LevelOfSupport?:string;
    ExtendedSupportEndDate?:Date
    EoslStartDate?:Date
    FullReleaseNotes?:string
    Timestamp?:Date
    is_new?:boolean

}







