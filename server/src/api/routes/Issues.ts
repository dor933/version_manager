import express from "express";
import multer from "multer";
import fs from "fs";
import { db, logger } from "../../BackendLogic/index";
import { getproductsandmodules } from "../../BackendLogic/Functions/LogicFunctions";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    // Store temporarily in uploads folder
    const tempDir = "server/uploads/temp";
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix + ".jpg");
  },
});
const upload = multer({ storage: storage });

router.post("/:issueId/addresolution", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { resolution } = req.body;
    logger.info("Adding resolution for issue:", issueId, resolution);

    await db.UpdateRecord(
      "Issue",
      ["Resolution"],
      [resolution],
      ["IssueId"],
      [issueId]
    );

    const products = await db.getProducts();
    const productsandmodules = await getproductsandmodules(products);

    res.json({ success: true, productsandmodules: productsandmodules });
  } catch (error) {
    logger.error("Error adding resolution:", error);
    res.status(500).json({ success: false });
  }
});

router.post("/:issueId/addworkaround", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { workaround } = req.body;
    logger.info("Adding workaround for issue:", issueId, workaround);

    await db.UpdateRecord(
      "Issue",
      ["Workaround"],
      [workaround],
      ["IssueId"],
      [issueId]
    );

    const products = await db.getProducts();
    const productsandmodules = await getproductsandmodules(products);

    res.json({ success: true, productsandmodules: productsandmodules });
  } catch (error) {
    logger.error("Error adding workaround:", error);
    res.status(500).json({ success: false });
  }
});

router.get("/:issueId/photos", (req, res) => {
  try {
    const issueId = req.params.issueId;
    const issueDir = `server/uploads/issues/${issueId}`;
    logger.info("issueDir", issueDir);

    if (fs.existsSync(issueDir)) {
      logger.info("issueDir exists");
      const photos = fs.readdirSync(issueDir);
      logger.info("photos", photos);
      res.json({
        photos: photos.map(
          (filename) => `server/uploads/issues/${issueId}/${filename}`
        ),
      });
    } else {
      logger.info("issueDir does not exist");
      res.json({ photos: [] });
    }
  } catch (error) {
    logger.error("Error getting photos:", error);
    res.status(500).json({ success: false });
  }
});

router.post("/:issueId/addphotos", upload.array("photos"), async (req, res) => {
  try {
    const issueId = req.params.issueId;
    const photos = req.files;
    const issueDir = `server/uploads/issues/${issueId}`;
    //if not exists, create it
    if (!fs.existsSync(issueDir)) {
      fs.mkdirSync(issueDir, { recursive: true });
    }
    if (photos && Array.isArray(photos) && photos.length > 0) {
      for (let photo of photos as Express.Multer.File[]) {
        const newPath = `${issueDir}/${photo.filename}`;
        fs.renameSync(photo.path, newPath);
      }
    }
    res.json({ success: true, issueId, photos });
  } catch (err: any) {
    logger.error(err);
    res.json({ success: false });
  }
});

router.post("/report", upload.array("photos"), async (req, res) => {
  try {
    const {
      vendor,
      product,
      version,
      module,
      email,
      severity,
      issueDescription,
      rule,
    } = req.body;
    const photos = req.files;

    let userid = await db.CheckUserExists(email);
    if (!userid) {
      await db.registerUser(email);
      userid = await db.CheckUserExists(email);
    }

    if (userid) {
      const issueId = await db.report(
        vendor,
        product,
        version,
        module,
        email,
        severity,
        issueDescription,
        userid,
        rule ? rule : null
      );

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

      let products = await db.getProducts();
      let productsandmodules = await getproductsandmodules(products);

      res.json({
        report: true,
        issueId: issueId,
        productsandmodules: productsandmodules,
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
