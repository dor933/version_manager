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
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../../BackendLogic/index");
const LogicFunctions_1 = require("../../BackendLogic/Functions/LogicFunctions");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Store temporarily in uploads folder
        const tempDir = 'server/uploads/temp';
        // Create temp directory if it doesn't exist
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.originalname + '-' + uniqueSuffix + '.jpg');
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/:issueId/addresolution', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { issueId } = req.params;
        const { resolution } = req.body;
        console.log('Adding resolution for issue:', issueId, resolution);
        yield index_1.db.UpdateRecord('Issue', ['Resolution'], [resolution], ['IssueId'], [issueId]);
        const products = yield index_1.db.getProducts();
        const productsandmodules = yield (0, LogicFunctions_1.getproductsandmodules)(products);
        res.json({ success: true, productsandmodules: productsandmodules });
    }
    catch (error) {
        index_1.logger.error('Error adding resolution:', error);
        res.status(500).json({ success: false });
    }
}));
router.post('/:issueId/addworkaround', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { issueId } = req.params;
        const { workaround } = req.body;
        console.log('Adding workaround for issue:', issueId, workaround);
        yield index_1.db.UpdateRecord('Issue', ['Workaround'], [workaround], ['IssueId'], [issueId]);
        const products = yield index_1.db.getProducts();
        const productsandmodules = yield (0, LogicFunctions_1.getproductsandmodules)(products);
        res.json({ success: true, productsandmodules: productsandmodules });
    }
    catch (error) {
        index_1.logger.error('Error adding workaround:', error);
        res.status(500).json({ success: false });
    }
}));
router.get('/:issueId/photos', (req, res) => {
    try {
        const issueId = req.params.issueId;
        const issueDir = `server/uploads/issues/${issueId}`;
        console.log('issueDir', issueDir);
        if (fs_1.default.existsSync(issueDir)) {
            console.log('issueDir exists');
            const photos = fs_1.default.readdirSync(issueDir);
            console.log('photos', photos);
            res.json({
                photos: photos.map(filename => `server/uploads/issues/${issueId}/${filename}`)
            });
        }
        else {
            console.log('issueDir does not exist');
            res.json({ photos: [] });
        }
    }
    catch (error) {
        index_1.logger.error('Error getting photos:', error);
        res.status(500).json({ success: false });
    }
});
router.post('/:issueId/addphotos', upload.array('photos'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issueId = req.params.issueId;
        const photos = req.files;
        const issueDir = `server/uploads/issues/${issueId}`;
        //if not exists, create it
        if (!fs_1.default.existsSync(issueDir)) {
            fs_1.default.mkdirSync(issueDir, { recursive: true });
        }
        if (photos && Array.isArray(photos) && photos.length > 0) {
            for (let photo of photos) {
                const newPath = `${issueDir}/${photo.filename}`;
                fs_1.default.renameSync(photo.path, newPath);
            }
        }
        res.json({ success: true, issueId, photos });
    }
    catch (err) {
        index_1.logger.error(err);
        res.json({ success: false });
    }
}));
router.post('/report', upload.array('photos'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendor, product, version, module, email, severity, issueDescription, rule } = req.body;
        const photos = req.files;
        let userid = yield index_1.db.CheckUserExists(email);
        if (!userid) {
            yield index_1.db.registerUser(email);
            userid = yield index_1.db.CheckUserExists(email);
        }
        if (userid) {
            const issueId = yield index_1.db.report(vendor, product, version, module, email, severity, issueDescription, userid, rule ? rule : null);
            if (photos && Array.isArray(photos) && photos.length > 0) {
                // Create issue directory if it doesn't exist
                const issueDir = `server/uploads/issues/${issueId}`;
                fs_1.default.mkdirSync(issueDir, { recursive: true });
                // Move files from temp to issue directory
                for (const photo of photos) {
                    const newPath = `${issueDir}/${photo.filename}`;
                    fs_1.default.renameSync(photo.path, newPath);
                }
            }
            let products = yield index_1.db.getProducts();
            let productsandmodules = yield (0, LogicFunctions_1.getproductsandmodules)(products);
            res.json({
                report: true,
                issueId: issueId,
                productsandmodules: productsandmodules
            });
        }
        else {
            res.json({ report: false });
        }
    }
    catch (err) {
        index_1.logger.error(err);
        res.json({ report: false });
    }
}));
exports.default = router;
