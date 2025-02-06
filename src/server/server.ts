import express from 'express';
import { db, logger } from '../index';
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store temporarily in uploads folder
    const tempDir = 'uploads/temp';
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname + '-' + uniqueSuffix + '.jpg');
  }
});
const upload = multer({ storage: storage });
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Add this after other app.use() calls but before routes
app.use('/uploads', express.static('uploads'));

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

app.post('/api/report', upload.array('photos'), async (req, res) => {
  try {
    const { vendor, product, version, module, email, severity, issueDescription, rule } = req.body;
    const photos = req.files;
    
    let userid = await db.CheckUserExists(email);
    if (!userid) {
      await db.registerUser(email);
      userid = await db.CheckUserExists(email);
    }

    if (userid) {
      const issueId = await db.report(vendor, product, version, module, email, severity, issueDescription, userid, rule ? rule : null);
      
      if (photos && Array.isArray(photos) && photos.length > 0) {
        // Create issue directory if it doesn't exist
        const issueDir = `uploads/issues/${issueId}`;
        fs.mkdirSync(issueDir, { recursive: true });

        // Move files from temp to issue directory
        for (const photo of photos as Express.Multer.File[]) {
          const newPath = `${issueDir}/${photo.filename}`;
          fs.renameSync(photo.path, newPath);
        }
      }

      res.json({
        report: true,
        issueId: issueId
      });
    } else {
      res.json({ report: false });
    }
  } catch (err: any) {
    logger.error(err);
    res.json({ report: false });
  }
});

app.post('/api/issues/:IssueId/addresolution', async (req, res) => {
  try {
    const { IssueId } = req.params;
    const { resolution } = req.body;
    console.log('Adding resolution for issue:', IssueId, resolution);
    
    await db.UpdateRecord(
      'Issues',
      ['Resolution'],
      [resolution],
      'IssueId',
      IssueId
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding resolution:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/issues/:IssueId/addworkaround', async (req, res) => {
  try {
    const { IssueId } = req.params;
    const { workaround } = req.body;
    console.log('Adding workaround for issue:', IssueId, workaround);
    
        await db.UpdateRecord(
      'Issues',
      ['Workaround'],
      [workaround],
      'IssueId',
      IssueId
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error adding workaround:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/issues/:issueId/addphotos', upload.array('photos'), async (req, res) => {

  try{

  const issueId = req.params.issueId;
  const photos = req.files;
  const issueDir = `uploads/issues/${issueId}`;
  //if not exists, create it
  if(!fs.existsSync(issueDir)){
    fs.mkdirSync(issueDir, { recursive: true });
  }
  if(photos && Array.isArray(photos) && photos.length > 0){
    for(let photo of photos as Express.Multer.File[]){
      const newPath = `${issueDir}/${photo.filename}`;
      fs.renameSync(photo.path, newPath);
    }
  }
  res.json({success:true, issueId, photos})
  }
  catch(err:any){
    logger.error(err);
    res.json({success:false});
  }
})

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

app.get('/api/issues/:issueId/photos', (req, res) => {
  const issueId = req.params.issueId;
  const issueDir = `uploads/issues/${issueId}`;
  console.log('issueDir', issueDir)
  
  if (fs.existsSync(issueDir)) {
    console.log('issueDir exists')
    const photos = fs.readdirSync(issueDir);
    console.log('photos', photos)
    res.json({
      photos: photos.map(filename => `/uploads/issues/${issueId}/${filename}`)
    });
  } else {
    console.log('issueDir does not exist')
    res.json({ photos: [] });
  }
});

// Error handling middleware should be last
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

