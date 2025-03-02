"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const node_windows_1 = require("node-windows");
const fs = __importStar(require("fs"));
// Parse command line arguments
function getEmails() {
    return __awaiter(this, void 0, void 0, function* () {
        const argv = yield (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
        let emails = argv.emails;
        let interval = argv.interval;
        let unit = argv.unit;
        startservice(emails, interval, unit);
    });
}
function startservice(emails, interval, unit) {
    return __awaiter(this, void 0, void 0, function* () {
        const isServiceCommand = process.argv.length > 2 && ['install', 'uninstall', 'start', 'stop'].includes(process.argv[2]);
        if (isServiceCommand) {
            // Service installation logic
            const svc = new node_windows_1.Service({
                name: 'VersionsManagerService',
                description: 'OPSWAT Versions Manager Service',
                script: path_1.default.join(__dirname, '../dist/index.js'),
                execPath: process.execPath,
                maxRestarts: 3,
                env: [
                    {
                        name: "NODE_ENV",
                        value: "production"
                    },
                    {
                        name: "CRON_INTERVAL",
                        value: (interval || process.env.CRON_INTERVAL || '1').toString()
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
                console.log('CRON_INTERVAL:', interval || process.env.CRON_INTERVAL || '1');
                console.log('UNIT:', unit || process.env.UNIT || 'MONTHS');
                // Start the Windows service
                svc.start();
                // Start the React app
                const { exec } = require('child_process');
                const reactAppPath = path_1.default.join(__dirname, '../../client'); // Adjust this path to your React app location
                exec('npm start', { cwd: reactAppPath }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error starting React app: ${error}`);
                        return;
                    }
                    console.log(`React app output: ${stdout}`);
                    if (stderr)
                        console.error(`React app errors: ${stderr}`);
                });
            });
            svc.on('error', (err) => {
                // Log to console
                console.error('Service error:', err);
                // Create error log entry
                const timestamp = new Date().toISOString();
                const logEntry = `${timestamp} - ERROR: ${err instanceof Error ? err.message : err}\n`;
                const errorLogPath = path_1.default.join(__dirname, '../error.log');
                // Append error to log file
                fs.appendFileSync(errorLogPath, logEntry, 'utf8');
            });
            // ... rest of the service event handlers ...
        }
        else {
            // Start both the main application and React app in non-service mode
            require('./index.js');
            const { exec } = require('child_process');
            const reactAppPath = path_1.default.join(__dirname, '../../client'); // Adjust this path to your React app location
            exec('npm start', { cwd: reactAppPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error starting React app: ${error}`);
                    return;
                }
                console.log(`React app output: ${stdout}`);
                if (stderr)
                    console.error(`React app errors: ${stderr}`);
            });
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    getEmails();
}))();
