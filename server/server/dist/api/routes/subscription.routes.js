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
const index_1 = require("../../backend_logic/index");
const router = express_1.default.Router();
router.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendor, email, product, Unit_of_time, Frequency } = req.body;
    let result;
    try {
        const existinguser = yield index_1.db.CheckUserExists(email);
        if (!existinguser) {
            console.log('User not found, registering user');
            result = yield index_1.db.registerUser(email);
        }
        const userid = yield index_1.db.CheckUserExists(email);
        if (vendor === 'All Vendors') {
            let allproducts = yield index_1.db.getProducts();
            for (let product of allproducts) {
                result = yield index_1.db.subscribe(userid, product.ProductName, product.VendorName, Unit_of_time, Frequency);
            }
        }
        else if (product === 'All Products') {
            let allproducts = yield index_1.db.getProducts(vendor);
            for (let product of allproducts) {
                result = yield index_1.db.subscribe(userid, product.ProductName, product.VendorName, Unit_of_time, Frequency);
            }
        }
        else {
            result = yield index_1.db.subscribe(userid, product, vendor, Unit_of_time, Frequency);
        }
        res.json({ subscribe: result });
    }
    catch (err) {
        index_1.logger.error(err);
        res.json({ subscribe: false });
    }
}));
exports.default = router;
