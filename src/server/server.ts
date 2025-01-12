import express from 'express';
import { db } from '../index';


const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.post('/api/subscribe', async (req, res) => {
  const { vendor, email } = req.body;

  const existinguser= await db.checkUser(email);
  if(existinguser){
    res.json({subscribe:'Already Subscribed'});
  }
  else{
  await db.subscribe(vendor, email);
  let ifexists= await db.checkUser(email);
    res.json({subscribe:ifexists});
  }

});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/versions', async (req, res) => {
   const versions = await db.getVersions();
   res.json({versions});
});

app.get('/api/sync', async (req, res) => {
    const sync = await db.HandleData();
    const versions = await db.getVersions();
    res.json({sync, versions});
});


export function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
}