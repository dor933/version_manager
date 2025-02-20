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


export type { version_extracted, Type1Products, Type2Products }