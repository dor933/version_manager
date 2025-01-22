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
    let allproducts:any= await db.getProducts(vendor);
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

app.post('/api/report', async (req, res) => {

  try{
  const { vendor, product, version, module, email, severity, issueDescription, rule } = req.body;
  console.log(vendor, product, version, module, email, severity, issueDescription, rule? rule : null);
  let userid= await db.CheckUserExists(email);
  if(!userid){
    await db.registerUser(email);
    userid= await db.CheckUserExists(email);
  }
  if(userid){
    const report= await db.report(vendor, product, version, module, email, severity, issueDescription, userid, rule? rule : null);
    res.json({report});
  }
  else{
    res.json({report:false});
  }
  }
  catch(err:any){
    logger.error(err);
    res.json({report:false});
  }
});



app.get('/api/versions', async (req, res) => {
   const versions = await db.getVersions();
   let products:any= await db.getProducts();
   let productsandmodules:any= [];

   for(let product of products){
    let modules= await db.getmodules(product.ProductName, product.VendorName);
    let issues= await db.getissues(product.ProductName, product.VendorName);
    productsandmodules.push({ProductName: product.ProductName, modules: modules, issues: issues});
   }

   console.log('productsandmodules',productsandmodules);
   


   res.json({versions, productsandmodules});
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