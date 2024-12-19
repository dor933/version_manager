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

export type { Type1Products, Type2Products }