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
    Extended_Support_End_Date?:Date
    EOSL_Start_Date?:Date
    release_notes?:string
    Timestamp?:Date
    is_new?:boolean
    full_release_notes?:string

}


type version_extracted= [version_name:string, release_date: string | null, end_of_support_date:string | null, level_of_support?: string, extended_support_end_date? : string,eosl_start_date?:string]



type Type1Products = 
    'Metadefender_Core' | 
    'OCMv7' | 
    'Metadefender_Kiosk' | 
    'Metadefender_Vault' | 
    'Metadefender_Gateway_Email_Security' | 
    'Metadefender_Icap_Server' | 
    'Metadefender_MFT' | 
    'Metadefender_Cloud';

type Type2Products = 
    'Metadefender_Sandbox' |
    'Metadefender_Cloud_Email_Security' |
    'Metadefender_Drive' |
    'Metadefender_Kiosk_Linux' |
    'Metadefender_Storage_Secuitry' |
    'Metadefender_Update_Downloader' |
    'Metadefender Endpoint' |
    'Cloud Secuirty For Salesforce' |
    'Metadefender_Secuirty_Gateway' |
    'Metadefender_Software_Supply_Chain' |
    'Metadefender_Central_Management';

export type { Type1Products, Type2Products, version_extracted }