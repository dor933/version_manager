import nodecron from 'node-cron';
import { Database } from './Db';
import { sendEmail } from './Functions';
import winston from 'winston';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
let errorCount=0;
let notificationEmails:any= process.env.NOTIFICATION_EMAILS;
let croninterval:any= process.env.CRON_INTERVAL;
let isinit=true;


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
        default: process.env.CRON_INTERVAL || 60
    })
    .argv;





notificationEmails = argv.emails!==''? argv.emails : argv.email!==''? argv.email : process.env.NOTIFICATION_EMAILS;
croninterval= argv.interval? argv.interval: parseInt(process.env.CRON_INTERVAL!)

console.log('Notification Emails are now:', notificationEmails)
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
    logger.info(`Starting version manager service with ${croninterval} minute interval`);
    isinit=false;
    console.log('notificationEmails',notificationEmails);
    
    cronJob = nodecron.schedule(`*/${croninterval} * * * *`, async () => {
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
    // await db.HandleData();
    getEmails();
})();

export { logger, notificationEmails, isinit };


