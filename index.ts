import { Vendor, Product, Version } from './Classes';
import nodecron from 'node-cron';
import fs from 'fs';
import { Database } from './Db';


const db = new Database();


const data = require('./Data.json');
nodecron.schedule('*/1 * * * *', () => {
    console.log('Running every 1 minutes');


    db.HandleData();


    
});




