import nodecron from 'node-cron';
import { SendEmail } from './Functions/LogicFunctions';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { startServer } from '../api/startup'
import { syncModels } from './Database/ORM';
import Database from './Database/DatabaseOps';
let errorCount=0;
let croninterval:any= process.env.CRON_INTERVAL;
let unit=process.env.UNIT;
let isinit=false;

// Configure logger with new file for each day


const logger = winston.createLogger({

    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
        
    ),
    transports: [
        new DailyRotateFile({
            filename: 'server/logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d'  // Keep logs for 14 days
        }),
        new DailyRotateFile({
            filename: 'server/logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'  // Keep logs for 14 days
        })
    ]
});


// Add new SQL logger
const sqlLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new DailyRotateFile({
            filename: 'server/logs/sql-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'  // Keep logs for 14 days
        })
    ]
});

// Add console logging for SQL in development
if (process.env.NODE_ENV !== 'production') {
    sqlLogger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));

    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Configuration
console.log('trying to init db');
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
                    await SendEmail({
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

    if(signal=='SIGINT' || signal=='SIGTERM'){
        logger.info('Shutdown complete');
        process.exit(0);
    }

    logger.info('Shutdown complete, But Database is not closed');
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
    try {
        // Sync database without forcing recreation

        logger.info('Syncing database models...');
        await syncModels();

        
        // Then start handling data
        await db.HandleData();
        logger.info('Initiation finished successfully');

        startServer();
        logger.info('Initiate version manager...');
        
        // Finally start the cron job
        startCronJob();
    } catch (error) {
        logger.error('Error during startup:', error);
        await shutdown('startup error');
    }
})();





export { logger, sqlLogger, isinit, db };


