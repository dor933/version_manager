import express from 'express';
import { db, logger } from '../../BackendLogic/index';

const router = express.Router();


router.post('/subscribe', async (req, res) => {
    const { vendor, email , product, unitOfTime} = req.body;
  
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
        result= await db.subscribe(userid, product.ProductName, product.VendorName, unitOfTime);
      }
    }
    else if(product==='All Products'){
      let allproducts:any= await db.getProducts(vendor);
      for(let product of allproducts){
        result= await db.subscribe(userid, product.ProductName, product.VendorName, unitOfTime);
      }
    }
  
    else{
      result= await db.subscribe(userid, product, vendor, unitOfTime);
    }
    
    res.json({subscribe:result});
    }
    catch(err:any){
      logger.error(err);
      res.json({subscribe:false});
    }
  
  });

  router.post('/NotifyTest', async (req, res) => {
    try { 
      const { email, productToNotify, vendorToNotify, unitOfTime, interval } = req.body;
      const result = await db.processTestNotifications(email, productToNotify, unitOfTime, interval, vendorToNotify);
      res.json( result );
    } catch (err: any) {
      logger.error(err);
      res.status(500).json({ error: 'Failed to process test notification' });
    }
  });
  
export default router; 