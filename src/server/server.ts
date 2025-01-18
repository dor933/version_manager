import express from 'express';
import { db, logger } from '../index';


const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.post('/api/subscribe', async (req, res) => {
  const { vendor, email , product, version, Unit_of_time, Frequency} = req.body;

  try{

  const existinguser= await db.CheckUserExists(email);
  if(!existinguser){  
  await db.registerUser(email);
  }

  if(vendor==='All'){
    let allversions:any= await db.getVersions()
    for(let version of allversions){
      await db.subscribe(email, version.ProductName, version.VendorName, version.VersionName, version.Unit_of_time, version.Frequency);
    }
  }
  else if(product==='All'){
    let allproducts:any= await db.getVersions(vendor);
    for(let product of allproducts){
      await db.subscribe(email, product.ProductName, product.VendorName, product.VersionName, product.Unit_of_time, product.Frequency);
    }
  }
  else if(version==='All'){
    let allversions:any= await db.getVersions(vendor, product);
    for(let version of allversions){
      await db.subscribe(email, version.ProductName, version.VendorName, version.VersionName, version.Unit_of_time, version.Frequency);
    }
    }
  else{
    await db.subscribe(email, product, vendor, version, Unit_of_time, Frequency);
  }
  res.json({subscribe:true});
  }
  catch(err:any){
    logger.error(err);
    res.json({subscribe:false});
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