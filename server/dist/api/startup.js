"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const version_routes_1 = __importDefault(require("./routes/version.routes"));
const issue_routes_1 = __importDefault(require("./routes/issue.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Static file serving with absolute path
const uploadsPath = path_1.default.join(__dirname, '../../uploads');
console.log('Uploads directory path:', uploadsPath);
console.log('Uploads directory exists:', fs_1.default.existsSync(uploadsPath));
app.use('/server/uploads', express_1.default.static(uploadsPath));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// Routes
app.use('/api', version_routes_1.default);
app.use('/api/issues', issue_routes_1.default);
app.use('/api', subscription_routes_1.default);
// Error handling middleware should be last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
