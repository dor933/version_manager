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
  const { vendor, email , product, Unit_of_time, Frequency} = req.body;

  let result:any;

  try{

  const existinguser= await db.CheckUserExists(email);
  if(!existinguser){  
    console.log('User not found, registering user');
    result= await db.registerUser(email);

  }

  const userid:number= await db.CheckUserExists(email);

  if(vendor==='All Vendors'){
    let allproducts:any= await db.getProducts()
    for(let product of allproducts){
      result= await db.subscribe(userid, product.ProductName, product.VendorName, Unit_of_time, Frequency);
    }
  }
  else if(product==='All Products'){
    let allproducts:any= await db.getVersions(vendor);
    for(let product of allproducts){
      result= await db.subscribe(userid, product.ProductName, product.VendorName, Unit_of_time,Frequency);
    }
  }

  else{
    result= await db.subscribe(userid , product, vendor, Unit_of_time, Frequency);
  }
  
  res.json({subscribe:result});
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