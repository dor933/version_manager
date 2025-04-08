"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const Versions_1 = __importDefault(require("./routes/Versions"));
const Issues_1 = __importDefault(require("./routes/Issues"));
const Subscriptions_1 = __importDefault(require("./routes/Subscriptions"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const app = (0, express_1.default)();
const port = process.env.PORT || 443;
// Middleware
app.use(express_1.default.json());
// Debug middleware to log all requests
app.use((req, _, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Static file serving with absolute path
const uploadsPath = path_1.default.join(__dirname, "../../uploads");
console.log("Uploads directory path:", uploadsPath);
console.log("Uploads directory exists:", fs_1.default.existsSync(uploadsPath));
app.use("/server/uploads", express_1.default.static(uploadsPath));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// Routes
app.use("/api", Versions_1.default);
app.use("/api/issues", Issues_1.default);
app.use("/api", Subscriptions_1.default);
// Add this after your other middleware and route configurations
if (process.env.ENVIRONMENT === "PRODUCTION") {
    // Serve static files from client/build
    const clientBuildPath = path_1.default.join(__dirname, "../../../client/build");
    app.use(express_1.default.static(clientBuildPath));
    // Serve index.html for any other routes (for client-side routing)
    app.get("*", (req, res) => {
        res.sendFile(path_1.default.join(clientBuildPath, "index.html"));
    });
}
// Error handling middleware should be last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});
function startServer() {
    const certPath = path_1.default.join(__dirname, "../../certificates", "certificate.pem");
    const keyPath = path_1.default.join(__dirname, "../../certificates", "private-key.pem");
    const httpsOptions = {
        key: fs_1.default.readFileSync(keyPath),
        cert: fs_1.default.readFileSync(certPath),
    };
    https_1.default.createServer(httpsOptions, app).listen(port, () => {
        console.log(`HTTPS Server running on https://vmanager.bulwarx.local:${port}`);
    });
}
