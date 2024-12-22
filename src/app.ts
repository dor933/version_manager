import * as path from 'path';
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
    name: 'VersionsManagerService',
    description: 'OPSWAT Versions Manager Service',
    script: path.join(__dirname, 'index.js'),
    nodeOptions: [],
    workingDirectory: __dirname,
    allowServiceLogon: true,
    // Restart service if it crashes
    maxRestarts: 3,
    // Wait time between restarts
    restartDelay: 3000
});

// Listen for service events
svc.on('install', () => {
    console.log('Service installed successfully');
    svc.start();

});

svc.on('start', () => {
    console.log('Service started successfully');
});

svc.on('stop', () => {
    console.log('Service stopped');
});

svc.on('error', (error: Error) => {
    console.error('Service error:', error);
});

svc.on('uninstall', () => {
    console.log('Service uninstalled successfully');
});

// Handle command line arguments
const args = process.argv.slice(2);
const validCommands = ['install', 'uninstall', 'start', 'stop', 'restart'];

if (args.length === 0) {
    console.log(`Please specify a command: ${validCommands.join(', ')}`);
    process.exit(1);
}

const command = args[0].toLowerCase();

if (!validCommands.includes(command)) {
    console.log(`Invalid command. Use one of: ${validCommands.join(', ')}`);
    process.exit(1);
}

try {
    switch (command) {
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
        case 'restart':
            svc.restart();
            break;
    }
} catch (error) {
    console.error('Error executing command:', error);
    process.exit(1);
} 
