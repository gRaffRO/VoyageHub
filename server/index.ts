import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Database } from './database';
import { authRoutes } from './routes/auth';
import { vacationRoutes } from './routes/vacations';
import { taskRoutes } from './routes/tasks';
import { budgetRoutes } from './routes/budget';
import { documentRoutes } from './routes/documents';
import { notificationRoutes } from './routes/notifications';
import { authenticateToken } from './middleware/auth';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://0.0.0.0:5173",
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
}
)
// Initialize database with proper error handling
async function initializeApp() {
  try {
    await Database.initialize();
    console.log('Database initialized successfully');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/vacations', vacationRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/budget', budgetRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/notifications', notificationRoutes);
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('join-vacation', (vacationId) => {
        socket.join(`vacation-${vacationId}`);
        console.log(`User ${socket.id} joined vacation ${vacationId}`);
      });
      
      socket.on('leave-vacation', (vacationId) => {
        socket.leave(`vacation-${vacationId}`);
        console.log(`User ${socket.id} left vacation ${vacationId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
    
    // Start server
    server.listen(PORT, () => {
      console.log('\n🚀 VoyageHub API Server');
      console.log(`📡 Running on: http://localhost:${PORT}`);
      console.log('🌐 Frontend: http://localhost:5173');
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log('⚡ Ready for connections!\n');
    });
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}
try {
  Database.initialize();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vacations', authenticateToken, vacationRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/budget', authenticateToken, budgetRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VoyageHub API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      vacations: '/api/vacations/*',
      tasks: '/api/tasks/*',
      budget: '/api/budget/*',
      documents: '/api/documents/*',
      notifications: '/api/notifications/*'
    },
    frontend: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Socket.IO for real-time features
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // TODO: Verify JWT token
  next();
});
// Initialize the application
initializeApp();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  server.close(() => {
    Database.close();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  server.close(() => {
    Database.close();
    process.exit(0);
  });
});

export { io };