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
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
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
