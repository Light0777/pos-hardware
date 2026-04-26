import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { runMigrations } from './database/migrations/001_initial.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/carts.js';
import saleRoutes from './routes/sales.js';
import settingsRoutes from './routes/settings.js';
import customerRoutes from './routes/customers.js';
import purchaseRoutes from './routes/purchases.js';
import supplierRoutes from './routes/suppliers.js';
import reportRoutes from './routes/reports.js';
import staffRoutes from './routes/staff.js';

// Load environment variables - simplified for CommonJS
dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Run database migrations
runMigrations();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'POS Billing API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export startServer function for Electron
export function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
        resolve();
      });
      server.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Check if running in Electron
const isElectron = process.env.ELECTRON_RUNNING === 'true';
const isMainModule = typeof require !== 'undefined' && require.main === module;

// Only auto-start if:
// 1. Not in Electron (Electron will call startServer manually)
// 2. It's the main module
if (isMainModule) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;