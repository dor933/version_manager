import path from 'path';
import yargs, { argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Service} from 'node-windows';
import * as fs from 'fs';
// Parse command line arguments


async function getEmails(){


const argv = await yargs(hideBin(process.argv))
    .option('emails', {
        alias: 'e',
        type: 'string',
        description: 'Email addresses for notifications'
    })
    .option('interval', {
        alias: 'i',
        type: 'number',
        description: 'Cron interval in minutes'
    })
    .option('unit', {
        alias: 'u',
        type: 'string',
        description: 'Interval time unit',
        default: process.env.UNIT || 'MONTHS'
    })
    .parseAsync();

    let emails= argv.emails;
    let interval= argv.interval;
    let unit= argv.unit;

    startservice(emails!,interval!,unit!)

    

}

async function startservice(emails:string, interval:number, unit:string){

const isServiceCommand = process.argv.length > 2 && ['install', 'uninstall', 'start', 'stop'].includes(process.argv[2]);

if (isServiceCommand) {
    // Service installation logic
    const svc = new Service({
        name: 'VersionsManagerService',
        description: 'OPSWAT Versions Manager Service',
        script: path.join(__dirname, '../dist/index.js'),
        execPath: process.execPath,
        maxRestarts: 3,
          env: [
            {
                name: "NODE_ENV",
                value: "production"
            },
            {
                name: "NOTIFICATION_EMAILS",
                value: emails || process.env.NOTIFICATION_EMAILS || ''
            },
            {
                name: "CRON_INTERVAL",
                value: (interval || process.env.CRON_INTERVAL || '60').toString()
            },
            {
                name: "UNIT",
                value: (unit || process.env.UNIT || 'MONTHS').toString()
            }
        ],

    });

    // Handle service commands
    switch (process.argv[2]) {
        case 'install':
            svc.install();
            break;
        case 'uninstall':
            svc.uninstall();
            break;
        case 'start':
            svc.start();
            break;
        case 'stop':
            svc.stop();
            break;
    }

    svc.on('install', () => {
        console.log('Service installed successfully');
        console.log('Environment variables set:');
        console.log('NOTIFICATION_EMAILS:', emails || process.env.NOTIFICATION_EMAILS || 'not set');
        console.log('CRON_INTERVAL:', interval || process.env.CRON_INTERVAL || '1');
        console.log('UNIT:', unit || process.env.UNIT || 'MONTHS');
        
        // Start the Windows service
        svc.start();
        
        // Start the React app
        const { exec } = require('child_process');
        const reactAppPath = path.join(__dirname, '../../client'); // Adjust this path to your React app location
        
        exec('npm start', { cwd: reactAppPath }, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Error starting React app: ${error}`);
                return;
            }
            console.log(`React app output: ${stdout}`);
            if (stderr) console.error(`React app errors: ${stderr}`);
        });
    });

    svc.on('error', (err:any) => {
        // Log to console
        console.error('Service error:', err);
        
        // Create error log entry
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ERROR: ${err instanceof Error ? err.message : err}\n`;
        const errorLogPath = path.join(__dirname, '../error.log');
        
        // Append error to log file
        fs.appendFileSync(errorLogPath, logEntry, 'utf8');
    });

    // ... rest of the service event handlers ...
} else {
    // Start both the main application and React app in non-service mode
    require('./index.js');
    
    const { exec } = require('child_process');
    const reactAppPath = path.join(__dirname, '../../client'); // Adjust this path to your React app location
    
    exec('npm start', { cwd: reactAppPath }, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Error starting React app: ${error}`);
            return;
        }
        console.log(`React app output: ${stdout}`);
        if (stderr) console.error(`React app errors: ${stderr}`);
    });
} 
}

(async () => {
    
    getEmails();
})();
