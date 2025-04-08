import express from "express";
import versionRoutes from "./routes/Versions";
import issueRoutes from "./routes/Issues";
import subscriptionRoutes from "./routes/Subscriptions";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Debug middleware to log all requests
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Static file serving with absolute path
const uploadsPath = path.join(__dirname, "../../uploads");
console.log("Uploads directory path:", uploadsPath);
console.log("Uploads directory exists:", fs.existsSync(uploadsPath));

app.use("/server/uploads", express.static(uploadsPath));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});



// Routes

app.use("/api", versionRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api", subscriptionRoutes);

// Add this after your other middleware and route configurations
if (process.env.ENVIRONMENT === 'PRODUCTION') {
  // Serve static files from client/build
  const clientBuildPath = path.join(__dirname, '../../../client/build');
  app.use(express.static(clientBuildPath));
  
  // Serve index.html for any other routes (for client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}



// Error handling middleware should be last
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

export function startServer() {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
