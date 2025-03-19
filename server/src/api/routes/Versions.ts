import express from "express";
import { db, logger } from "../../BackendLogic/index";
import { getproductsandmodules } from "../../BackendLogic/Functions/LogicFunctions";

const router = express.Router();

router.get("/versions", async (_, res) => {
  try {
    const versions = await db.getVersions();

    let products: any = await db.getProducts();

    let productsandmodules = await getproductsandmodules(products);

    res.json({ versions, productsandmodules });
  } catch (error) {
    logger.error("Error in getVersions", error);
    throw error;
  }
});

router.get("/sync", async (_, res) => {
  const sync = await db.HandleData();
  const versions = await db.getVersions();
  res.json({ sync, versions });
});

export default router;
