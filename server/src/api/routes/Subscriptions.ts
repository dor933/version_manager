import express from 'express';
import { db, logger } from '../../BackendLogic/index';

const router = express.Router();


router.post('/subscribe', async (req, res) => {
    const { vendor, email , product, Unit_of_time, Frequency} = req.body;
  
    let result:any;
  
    try{
  
    let existinguser= await db.CheckUserExists(email);
    if(existinguser===false){  
      logger.info('User not found, registering user');
    await db.registerUser(email);
  
    }
  
    const userid:number|false= await db.CheckUserExists(email);
    if(userid===false){
      res.json({subscribe:false});
      return;
    }

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
      result= await db.subscribe(userid, product, vendor, Unit_of_time, Frequency);
    }
    
    res.json({subscribe:result});
    }
    catch(err:any){
      logger.error(err);
      res.json({subscribe:false});
    }
  
  });
  
export default router; 