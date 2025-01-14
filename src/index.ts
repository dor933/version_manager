import nodecron from 'node-cron';
import { Database } from './Db';
import { sendEmail } from './Functions';
import winston from 'winston';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { startServer } from './server/server';
let errorCount=0;
let croninterval:any= process.env.CRON_INTERVAL;
let unit=process.env.UNIT;
let isinit=true;
import {extract_JSON_URL} from './Functions';
import { DataStructure, VersionData, version_extracted} from './types';
const Data=require('../Data.json') as DataStructure;
import fs from 'fs';

async function getEmails(){

const argv = await yargs(hideBin(process.argv))
    .option('emails', {
        alias: 'e',
        type: 'string',
        description: 'Email addresses to send notifications (comma-separated)',
        default: process.env.NOTIFICATION_EMAILS || ''
    })
    .option('interval', {
        alias: 'i',
        type: 'number',
        description: 'Cron job interval in minutes',
        default: process.env.CRON_INTERVAL || 1
    })
    .option('unit', {
        alias: 'u',
        type: 'string',
        description: 'Interval time unit',
        default: process.env.UNIT || 'months'
    })
    .argv;




    




croninterval= argv.interval? argv.interval: parseInt(process.env.CRON_INTERVAL!)
unit= argv.unit!==''? argv.unit : process.env.NOTIFICATION_EMAILS;

console.log('Interval is:', croninterval)




    startCronJob();
}

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Configuration
const db = new Database();
let cronJob: nodecron.ScheduledTask;

// Start the cron job
function startCronJob() {
    logger.info(`Starting version manager service with ${croninterval} ${unit} interval`);
    isinit=false;

    let cronExpression: string;

    switch(unit!.toLowerCase()) {
        case 'minutes':
            cronExpression = `*/${croninterval} * * * *`;
            break;
        case 'hours':
            // If interval is 1, run every hour at minute 0
            // If interval is 2, run every 2 hours at minute 0, etc.
            cronExpression = `0 */${croninterval} * * *`;
            break;
        case 'days':
            // For days, we run at specific time (00:00) every N days
            cronExpression = `0 0 */${croninterval} * *`;
            break;
        case 'months':
            // For months, we run at specific time (00:00) every N months
            cronExpression = `0 0 1 */${croninterval} *`;
            break;
        default:

        //default to monthly
        logger.warn(`Unrecognized unit: ${unit}, defaulting to monthly`);
            cronExpression = `0 0 1 */1 *`;
    }

    logger.info(`Cron expression: ${cronExpression}`);

    
    cronJob = nodecron.schedule(cronExpression, async () => {
        logger.info('Starting scheduled version check');
        
        try {
           let res= await db.HandleData();
           if(res instanceof Error){
            throw new Error(res.message);
           }
        } catch (error) {

            while(errorCount<=3){
                try{
                  let res=  await db.HandleData();
                  if(res instanceof Error){
                    throw new Error(res.message);
                   }
                    break;
                }catch(error){
                    errorCount++;
                    logger.error('Error during version check:', { error: error instanceof Error ? error.message : 'Unknown error' });
                    const emailBody =
                    {
                       "name":"Dor",
                       "subject":`Error in Version Manager`,
                       "row1":"Hey Dor",
                       "row2":`There is an error in Version Manager`,
                       "row3":"Error Details:",
                       "row4":"",
                       "row5":error+".",
                       "row6":"Please check the logs for more details.",
                       "row7":"",
                    }
                    await sendEmail({
                        subject: `Error in Version Manager`,
                        content: emailBody,
                        vendor_name:'NA'
                    });
                }
            }

            if(errorCount>3){

            await shutdown('Error in Version Manager');
            errorCount=0;
            }
           

      
        
        }
    });
}

// Graceful shutdown handler
async function shutdown(signal: string) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Stop the cron job
    if (cronJob) {
        cronJob.stop();
        logger.info('Stopped cron job');
    }

    try {
        // Close database connections
        await db.close(); // You'll need to implement this method in your Database class
        logger.info('Closed database connections');
    } catch (error) {
        logger.error('Error during database shutdown:', { error });
    }

    logger.info('Shutdown complete');
    process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error });
    shutdown('uncaught exception');
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { reason });
    shutdown('unhandled rejection');
});

// Start the application
(async () => {
    // startServer();
    // console.log('Initiate version manager...')
    // await db.HandleData();
    // console.log('Initiation finished successfully')
    // getEmails();

    console.log(Data)
    

   for(const vendor of Data.Vendors){

    for(const product of vendor.Products){
        let relevant_obj=await extract_JSON_URL(product.JSON_URL!);
        fs.writeFileSync(`relevant_obj_${vendor.VendorName}_${product.ProductName}.txt`, JSON.stringify(relevant_obj));
        console.log(relevant_obj);
    }
    
   }
 

})();

async function addKnownIssue(issue:any){
await db.insertData('Known_Issues',['VersionName','ProductName','VendorName','IssueName','IssueDescription','IssueDate','IssueStatus','IssueSeverity','IssueResolution'],[issue.VersionName,issue.ProductName,issue.VendorName,issue.IssueName,issue.IssueDescription,issue.IssueDate,issue.IssueStatus,issue.IssueSeverity,issue.IssueResolution]);
}

export { logger, isinit, db };


