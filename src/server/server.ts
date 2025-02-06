import express from 'express';
import { db, logger } from '../index';
import multer from 'multer';
import fs from 'fs';
import versionRoutes from './routes/version.routes';
import issueRoutes from './routes/issue.routes';
import subscriptionRoutes from './routes/subscription.routes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes
app.use('/api', versionRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', subscriptionRoutes);




// Error handling middleware should be last
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

