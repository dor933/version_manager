"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.isinit = exports.sqlLogger = exports.logger = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const LogicFunctions_1 = require("./Functions/LogicFunctions");
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const Startup_1 = require("../api/Startup");
const ORM_1 = require("./Database/ORM");
const DatabaseRunner_1 = __importDefault(require("./Database/DatabaseRunner"));
let errorCount = 0;
let croninterval = process.env.CRON_INTERVAL;
let unit = process.env.UNIT;
let isinit = false;
exports.isinit = isinit;
// Configure logger with new file for each day
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: 'server/logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d' // Keep logs for 14 days
        }),
        new winston_daily_rotate_file_1.default({
            filename: 'server/logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d' // Keep logs for 14 days
        })
    ]
});
exports.logger = logger;
// Add new SQL logger
const sqlLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: 'server/logs/sql-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d' // Keep logs for 14 days
        })
    ]
});
exports.sqlLogger = sqlLogger;
// Add console logging for SQL in development
if (process.env.NODE_ENV !== 'production') {
    sqlLogger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
// Configuration
console.log('trying to init db');
const db = new DatabaseRunner_1.default();
exports.db = db;
let cronJob;
// Start the cron job
function startCronJob() {
    logger.info(`Starting version manager service with ${croninterval} ${unit} interval`);
    exports.isinit = isinit = false;
    let cronExpression;
    switch (unit.toLowerCase()) {
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
    cronJob = node_cron_1.default.schedule(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
        logger.info('Starting scheduled version check');
        try {
            let res = yield db.HandleData();
            if (res instanceof Error) {
                throw new Error(res.message);
            }
        }
        catch (error) {
            while (errorCount <= 3) {
                try {
                    let res = yield db.HandleData();
                    if (res instanceof Error) {
                        throw new Error(res.message);
                    }
                    break;
                }
                catch (error) {
                    errorCount++;
                    logger.error('Error during version check:', { error: error instanceof Error ? error.message : 'Unknown error' });
                    const emailBody = {
                        "name": "Dor",
                        "subject": `Error in Version Manager`,
                        "row1": "Hey Dor",
                        "row2": `There is an error in Version Manager`,
                        "row3": "Error Details:",
                        "row4": "",
                        "row5": error + ".",
                        "row6": "Please check the logs for more details.",
                        "row7": "",
                    };
                    yield (0, LogicFunctions_1.sendEmail)({
                        subject: `Error in Version Manager`,
                        content: emailBody,
                        vendor_name: 'NA'
                    });
                }
            }
            if (errorCount > 3) {
                yield shutdown('Error in Version Manager');
                errorCount = 0;
            }
        }
    }));
}
// Graceful shutdown handler
function shutdown(signal) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);
        // Stop the cron job
        if (cronJob) {
            cronJob.stop();
            logger.info('Stopped cron job');
        }
        if (signal == 'SIGINT' || signal == 'SIGTERM') {
            logger.info('Shutdown complete');
            process.exit(0);
        }
        logger.info('Shutdown complete, But Database is not closed');
    });
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sync database without forcing recreation
        logger.info('Syncing database models...');
        yield (0, ORM_1.syncModels)();
        // Then start handling data
        yield db.HandleData();
        logger.info('Initiation finished successfully');
        (0, Startup_1.startServer)();
        logger.info('Initiate version manager...');
        // Finally start the cron job
        startCronJob();
    }
    catch (error) {
        logger.error('Error during startup:', error);
        yield shutdown('startup error');
    }
}))();
