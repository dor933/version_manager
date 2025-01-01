import path from 'path';
import yargs, { argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Service} from 'node-windows';
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
    .parseAsync();

    let emails= argv.emails;
    let interval= argv.interval;

    startservice(emails!,interval!)

    

}

async function startservice(emails:string, interval:number){

const isServiceCommand = process.argv.length > 2 && ['install', 'uninstall', 'start', 'stop'].includes(process.argv[2]);

if (isServiceCommand) {
    // Service installation logic
    const svc = new Service({
        name: 'VersionsManagerService',
        description: 'OPSWAT Versions Manager Service',
        script: path.join(process.cwd(), 'index.js'),
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
        console.log('CRON_INTERVAL:', interval || process.env.CRON_INTERVAL || '60');
        svc.start();
    });

    svc.on('error', (err)=> {

        console.error('Service err:',err)
    })

    // ... rest of the service event handlers ...
} else {
    // Normal application execution
    require('./index.js')
} 
}

(async () => {
    
    getEmails();
})();
