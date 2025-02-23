import express from 'express';
import { db, logger } from '../../backend_logic/index';

const router = express.Router();


router.post('/subscribe', async (req, res) => {
    const { vendor, email , product, Unit_of_time, Frequency} = req.body;
  
    let result:any;
  
    try{
  
    const existinguser= await db.CheckUserExists(email);
    if(existinguser===false){  
      console.log('User not found, registering user');
      result= await db.registerUser(email);
  
    }
  
    const userid:number|false= await db.CheckUserExists(email);
  
    if(vendor==='All Vendors'){
      let allproducts:any= await db.getProducts()
      for(let product of allproducts){
        result= await db.subscribe(userid as number, product.ProductName, product.VendorName, Unit_of_time, Frequency);
      }
    }
    else if(product==='All Products'){
      let allproducts:any= await db.getProducts(vendor);
      for(let product of allproducts){
        result= await db.subscribe(userid as number, product.ProductName, product.VendorName, Unit_of_time,Frequency);
      }
    }
  
    else{
      result= await db.subscribe(userid as number, product, vendor, Unit_of_time, Frequency);
    }
    
    res.json({subscribe:result});
    }
    catch(err:any){
      logger.error(err);
      res.json({subscribe:false});
    }
  
  });
  
export default router; 