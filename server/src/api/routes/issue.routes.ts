import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { db, logger } from '../../backend_logic/index';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Store temporarily in uploads folder
      const tempDir = 'server/uploads/temp';
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

router.post('/:issueId/addresolution', async (req, res) => {
    try {
        const { issueId } = req.params;
        const { resolution } = req.body;
        console.log('Adding resolution for issue:', issueId, resolution);
        
        await db.UpdateRecord(
          'Issues',
          ['Resolution'],
          [resolution],
          ['IssueId'],
          [issueId]
        );
        
        res.json({ success: true });
      } catch (error) {
        logger.error('Error adding resolution:', error);
        res.status(500).json({ success: false });
      }
});

router.post('/:issueId/addworkaround', async (req, res) => {
    try {
        const { issueId } = req.params;
        const { workaround } = req.body;
        console.log('Adding workaround for issue:', issueId, workaround);
        
            await db.UpdateRecord(
          'Issues',
          ['Workaround'],
          [workaround],
          ['IssueId'],
          [issueId]
        );
        
        res.json({ success: true });
      } catch (error) {
        logger.error('Error adding workaround:', error);
        res.status(500).json({ success: false });
      }
});

router.get('/:issueId/photos', (req, res) => {
    try {
        const issueId = req.params.issueId;
        const issueDir = `server/uploads/issues/${issueId}`;
        console.log('issueDir', issueDir)
        
    if (fs.existsSync(issueDir)) {
      console.log('issueDir exists')
      const photos = fs.readdirSync(issueDir);
      console.log('photos', photos)
      res.json({
        photos: photos.map(filename => `server/uploads/issues/${issueId}/${filename}`)
      });
    } else {
      console.log('issueDir does not exist')
        res.json({ photos: [] });
    }
    } catch (error) {
        logger.error('Error getting photos:', error);
        res.status(500).json({ success: false });
        }
});


router.post('/:issueId/addphotos', upload.array('photos'), async (req, res) => {

    try{
  
    const issueId = req.params.issueId;
    const photos = req.files;
    const issueDir = `server/uploads/issues/${issueId}`;
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

  router.post('/report', upload.array('photos'), async (req, res) => {
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
          const issueDir = `server/uploads/issues/${issueId}`;
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

export default router; 