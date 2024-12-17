import nodecron from 'node-cron';
import { Database } from './Db';


const db = new Database();


nodecron.schedule('*/1 * * * *', () => {
    console.log('Running every 1 minute');


    db.HandleData();


    
});




