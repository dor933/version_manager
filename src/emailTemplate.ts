const path = require('path');
const logo = path.join(__dirname, '../assets/logo.png');

console.log('logo', logo)

interface Content {
    subject: string;
    row1: string;
    row2: string;
    row3: string;
    row4: string;
    name: string;
}

export const createEmailTemplate = (content: Content) => `  
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
                                <img src="https://static.wixstatic.com/media/122b90_67401fc021a44296b98b2b0d82bd5bea~mv2.png" 
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
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <div style="color: #5E5E5E; font-size: 24px; max-width: 700px;">
                                                ${content.row1}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <div style="color: #5E5E5E; font-size: 24px; max-width: 700px;">
                                                ${content.row2}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <div style="color: #5E5E5E; font-size: 24px; max-width: 700px;">
                                                ${content.row3}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <div style="color: #5E5E5E; font-size: 24px; max-width: 700px;">
                                                ${content.row4}
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Button -->
                                    <tr>
                                        <td align="center" style="padding-top: 20px;">
                                            <table cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="background: #3490EC; border-radius: 60px; padding: 20px 40px; width: 100%;">
                                                        <span style="color: #FFFFFF; font-size: 18px; font-weight: bold; text-decoration: none; display: block; text-align: center; width: 100%;">
                                                            We will keep you updated with any changes
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
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


