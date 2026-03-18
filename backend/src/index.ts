import './config/env';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import claimRoutes from './routes/claimRoutes';
import adminRoutes from './routes/adminRoutes';
import assetRoutes from './routes/assetRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { connectDB } from './config/db';
import { initSocket } from './socket';

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

const desiredPortRaw = process.env.PORT;
const desiredPort = desiredPortRaw ? Number.parseInt(desiredPortRaw, 10) : NaN;
const BASE_PORT = Number.isFinite(desiredPort) && desiredPort > 0 ? desiredPort : 5000;

const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  httpServer.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// nodemon uses SIGUSR2 for restarts; without this, old process may keep PORT bound.
process.on('SIGUSR2', () => shutdown('SIGUSR2'));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'lostlink',
    message: 'LostLink API is running perfectly!',
    timestamp: new Date(),
  });
});

// Default catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const startServer = (port: number, retriesLeft: number) => {
  httpServer.once('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
      console.warn(`⚠️ Port ${port} is in use. Trying ${port + 1}...`);
      startServer(port + 1, retriesLeft - 1);
      return;
    }

    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Ports ${BASE_PORT}-${port} are already in use.`);
      console.error('Close the other running server(s) or change PORT in .env and try again.');
    } else {
      console.error('❌ Server error:', err);
    }

    process.exit(1);
  });

  httpServer.listen(port, async () => {
    const address = httpServer.address();
    const boundPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Server running on http://localhost:${boundPort}`);

    try {
      await connectDB();
      console.log('✅ MongoDB Database connected successfully.');
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB Database:', err);
    }
  });
};

// Start Server (try PORT, then fall back to the next ports)
startServer(BASE_PORT, 20);
