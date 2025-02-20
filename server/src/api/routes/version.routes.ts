import express from 'express';
import { db } from '../../backend_logic/index';

const router = express.Router();


router.get('/versions', async (req, res) => {
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
 
 router.get('/sync', async (req, res) => {
     const sync = await db.HandleData();
     const versions = await db.getVersions();
     res.json({sync, versions});
 });
 

export default router; 