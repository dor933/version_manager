import express from 'express';
import { db, logger } from '../../BackendLogic/index';

const router = express.Router();


router.get('/versions', async (req, res) => {
    try{
    const versions = await db.getVersions();
    if(versions.length>0){
        console.log('versions exist');
    }
    let products:any= await db.getProducts();
  
    let productsandmodules:any= [];
 
    for(let product of products){
     let modules= await db.getModules(product.ProductName, product.VendorName);
  
     let issues= await db.getIssues(product.ProductName, product.VendorName);
   
     productsandmodules.push({ProductName: product.ProductName, modules: modules, issues: issues});
    }
 

   
    res.json({versions, productsandmodules});
    }
    catch(error){
        logger.error('Error in getVersions', error);
        throw error;
    }
});

 router.get('/sync', async (req, res) => {
     const sync = await db.HandleData();
     const versions = await db.getVersions();
     res.json({sync, versions});
 });
 

export default router; 