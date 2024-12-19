import nodecron from 'node-cron';
import { Database } from './Db';
import { sendEmail } from './Functions';
let interval = 60;


const db = new Database();


nodecron.schedule(`*/${interval} * * * * `, async () => {
    console.log(`Running every ${interval} minutes`);

    

    await db.HandleData();


        }
  

    
);





