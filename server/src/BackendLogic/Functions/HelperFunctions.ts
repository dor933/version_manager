import { Type1Products } from '../../Types/WebTypes';

const EmailBodyCreator = (name:string, subject:string, row1:string, row2:string, row3:string, row4:string, row5:string, row6:string, row7:string) => {

    return {
        name:name,
        subject:subject,
        row1:row1,
        row2:row2,
        row3:row3,
        row4:row4,
        row5:row5,
        row6:row6,
        row7:row7
    }

}

const FortraVersionObjectCreator = (version:string, release_date:string, end_of_support_date:string, level_of_support:string, extended_support_end_date:string, eosl_start_date:string) => {

    return {
        version_name:version,
        release_date:release_date,
        end_of_support_date:end_of_support_date,
        level_of_support:level_of_support,
        extended_support_end_date:extended_support_end_date,
        eosl_start_date:eosl_start_date
    }

}

const isType1Product = (productName: string): productName is Type1Products => {
    return ['Metadefender_Core', 'OCMv7', 'Metadefender_Kiosk', 'Metadefender_Vault', 'Metadefender_Gateway_Email_Security', 'Metadefender_Icap_Server', 'Metadefender_MFT', 'Metadefender_Cloud'].includes(productName);
}

 // Modify the getMilliseconds function to handle case-sensitivity
 const GetMilliseconds = (frequency: string) => {
    const conversions = {
      'HOURS': 3600000,
      'DAYS': 86400000,
      'MONTHS': 2629746000,
      'Hours': 3600000,
      'Days': 86400000,
      'Months': 604800000,
    };
    
    const result = conversions[frequency as keyof typeof conversions];
    if (!result) {
      console.error('Invalid frequency:', frequency);
      return 0;
    }
    return result;
  };

  

export {EmailBodyCreator, FortraVersionObjectCreator, isType1Product, GetMilliseconds}
