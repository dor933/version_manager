import { Vendor, Product, Version } from './Classes';
import nodecron from 'node-cron';
import fs from 'fs';
import { Database } from './Classes';



const data = require('./Data.json');
nodecron.schedule('*/10 * * * *', () => {
    console.log('Running every 10 minutes');
    const db = new Database();


    
});




