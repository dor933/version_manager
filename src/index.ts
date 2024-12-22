import nodecron from 'node-cron';
import { Database } from './Db';
import { sendEmail } from './Functions';
import winston from 'winston';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
let errorCount=0;
let notificationEmails:any;


async function getEmails(){

const argv = await yargs(hideBin(process.argv))
    .option('emails', {
        alias: 'e',
        type: 'string',
        description: 'Email addresses to send notifications (comma-separated)',
        default: process.env.NOTIFICATION_EMAILS || ''
    })
    .argv;

    console.log('argv',argv);

// Convert emails string to array and validate

notificationEmails = argv.emails




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
const interval = process.env.CRON_INTERVAL ? parseInt(process.env.CRON_INTERVAL) : 1;
const db = new Database();
let cronJob: nodecron.ScheduledTask;

// Start the cron job
function startCronJob() {
    logger.info(`Starting version manager service with ${interval} minute interval`);
    console.log('notificationEmails',notificationEmails);
    
    cronJob = nodecron.schedule(`*/${interval} * * * *`, async () => {
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
getEmails();


export { logger,notificationEmails };




