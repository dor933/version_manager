const path = require('path');
const logo = path.join(__dirname, '../assets/logo.png');

console.log('logo', logo)

interface Content {
    subject: string;
    row1: string;
    row2: string;
    row3: string;
    row4: string;
    row5: string;
    row6: string;
    row7: string;
    name: string;
}

export const createEmailTemplate = (content: Content, vendorname:string) => `  
    <!DOCTYPE html>
    <html>
    <head>
        
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            }
        </style>
    </head>
    <body>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #EAF0F3; padding: 146px 171px 118px 158px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <!-- Logo Section -->
                        <tr>
                            <td align="center" style="padding-bottom: 67px;">
                            
                                <img src=${vendorname==='OPSWAT'? "https://static.wixstatic.com/media/122b90_67401fc021a44296b98b2b0d82bd5bea~mv2.png"  : vendorname==='Fortra'? "https://static.fortra.com/hs-logo.png" : null}
                                     alt="Logo" 
                                     style="width: 200px; height: 100px; border-radius: 25px;" />
                            </td>
                        </tr>
                        
                        <!-- Greeting Section -->
                        <tr>
                            <td align="center" style="padding-bottom: 30px;">
                                <table cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-size: 52px; padding-right: 10px;">Hey</td>
                                        <td style="font-size: 52px; font-weight: bold;"> ${content.name}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Subject Section -->
                        <tr>
                            <td align="center" style="padding-bottom: 67px;">
                                <div style="font-size: 24px; color: #000;">
                                    ${content.subject}
                                </div>
                            </td>
                        </tr>
                        
                        <!-- White Box Section -->
                        <tr>
                            <td align="center">
                                <table cellpadding="0" cellspacing="0" style="background-color: #FFF; border-radius: 6px; padding: 30px 185px 64px 187px;">
                                    <tr>
                                        <td align="center" style="padding-bottom: 47px;">
                                            <img src="https://cybersecurity-excellence-awards.com/wp-content/uploads/2022/01/507133.png" 
                                                 alt="Logo" 
                                                 style="width: 450px; height: 80px;" />
                                        </td>
                                    </tr>
                                    
                                    <!-- Content Rows -->
                                    <tr style="max-width:500px;">
                                        <td align="center" style="padding-bottom: 25px; ">
                                            <div style="color: #5E5E5E; font-size: 24px;">
                                                ${content.row1}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr style="max-width:500px;">
                                        <td align="center" style="padding-bottom: 25px; ">
                                            <div style="color: #5E5E5E; font-size: 24px;">
                                                ${content.row2}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr style="max-width:500px;">
                                        <td align="center" style="padding-bottom: 25px; ">
                                            <div style="color: #5E5E5E; font-size: 24px; ">
                                                ${content.row3}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr style="max-width:500px;">
                                        <td align="center" style="padding-bottom: 25px; ">
                                            <div style="color: #5E5E5E; font-size: 24px;">
                                                ${content.row4}
                                                <span style="color: #3490EC; font-size: 24px; font-weight: 700;">
                                                ${content.row5}
                                                </span>
                                                ${content.row6}
                                                <span style="color: #3490EC; font-size: 24px; font-weight: 700;">
                                                ${content.row7}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Button -->
                                    <tr style="max-width:500px;">
                                        <td>
                                            <a 
                                                href="http://192.168.27.42:3000" 
                                                target="_blank" 
                                                style="
                                                    text-decoration: none;
                                                    color: #0066cc;
                                                    cursor: pointer;
                                                "
                                            >
                                                Stay tuned for updates
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
`


