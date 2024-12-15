import { Vendor, Product, Version } from './Classes';
import nodecron from 'node-cron';
import fs from 'fs';
import { Database } from './Db';


const db = new Database();


const data = require('./Data.json');
nodecron.schedule('*/10 * * * *', () => {
    console.log('Running every 10 minutes');


    db.HandleData();


    
});




