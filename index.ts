import nodecron from 'node-cron';
import { Database } from './Db';


const db = new Database();


nodecron.schedule('*/10 * * * *', () => {
    console.log('Running every 10 minute');


    db.HandleData();


    
});




