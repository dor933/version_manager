"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../../BackendLogic/index");
const LogicFunctions_1 = require("../../BackendLogic/Functions/LogicFunctions");
const router = express_1.default.Router();
router.get('/versions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const versions = yield index_1.db.getVersions();
        let products = yield index_1.db.getProducts();
        let productsandmodules = yield (0, LogicFunctions_1.getproductsandmodules)(products);
        res.json({ versions, productsandmodules });
    }
    catch (error) {
        index_1.logger.error('Error in getVersions', error);
        throw error;
    }
}));
router.get('/sync', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sync = yield index_1.db.HandleData();
    const versions = yield index_1.db.getVersions();
    res.json({ sync, versions });
}));
exports.default = router;
