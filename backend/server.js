require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const { createLogger, format, transports } = require('winston');


// Initialize Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}] ${message} ${stack ? `\n${stack}` : ''}`;
        })
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();

// ===== CONFIGURATION =====
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee_management';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-strong-secret-here';

// ===== ENHANCED MIDDLEWARE STACK =====
app.use(helmet());
app.use(cookieParser());

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With'
  ],
  exposedHeaders: ['set-cookie', 'X-CSRF-Token']
}));

// Request logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parser with security limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===== ENHANCED DATABASE CONNECTION =====
const connectWithRetry = () => {
  return new Promise((resolve, reject) => {
    const connect = () => {
      logger.info(`Attempting MongoDB connection to: ${MONGODB_URI}`);

      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 30 seconds timeout
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        appName: 'EmployeeManagementAPI',
        maxPoolSize: 10,
        minPoolSize: 2,
        heartbeatFrequencyMS: 10000
      })
      .then(() => {
        logger.info('✅ MongoDB connection established');
        resolve();
      })
      .catch(err => {
        logger.error('❌ MongoDB connection failed:', err.message);
        logger.info('Retrying connection in 5 seconds...');
        setTimeout(connect, 5000);
      });
    };
    connect();
  });
};

// MongoDB connection event listeners
mongoose.connection.on('connecting', () => {
  logger.info('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connected to ${mongoose.connection.db?.databaseName || 'unknown database'}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

// ===== SESSION CONFIGURATION =====
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ===== RATE LIMITING =====
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later'
  }
});

app.use('/api/', apiLimiter);

// ===== CSRF PROTECTION =====
const csrfProtection = csrf({
  cookie: {
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  }
});

// Apply CSRF protection to all routes except API routes except /api/csrf-token
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/csrf-token')) {
    return next();
  }
  csrfProtection(req, res, next);
});

// CSRF token endpoint - must be after csrf middleware
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ===== ROUTES =====
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const positionRoutes = require('./routes/positionRoute');
//const reportRoutes = require('./routes/reportRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const activityRoutes = require('./routes/activityRoutes')





// API Routes with DB connection check middleware
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    logger.error('Database connection not ready');
    return res.status(503).json({
      status: 'error',
      message: 'Database service unavailable',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  next();
};

// Apply routes with proper prefixes
app.use('/api/admin', checkDbConnection, adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payroll', checkDbConnection, payrollRoutes);
app.use('/api/attendance', checkDbConnection, attendanceRoutes);
app.use('/api/leaves', checkDbConnection, leaveRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', checkDbConnection, departmentRoutes);
app.use('/api/admin/position', checkDbConnection, positionRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/activity', activityRoutes)
//app.use('/api/reports', checkDbConnection, reportRoutes);


// ===== FILE UPLOAD HANDLING =====
const uploadDir = path.join(__dirname, 'uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}
app.use('/uploads', express.static(uploadDir));

// ===== ENHANCED HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const status = dbStatus === 1 ? 'healthy' : 'degraded';

  const healthCheck = {
    status,
    database: {
      status: dbStatus === 1 ? 'connected' : 'disconnected',
      dbName: mongoose.connection.db?.databaseName || 'unknown',
      ping: dbStatus,
      models: mongoose.modelNames()
    },
    server: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: NODE_ENV,
      nodeVersion: process.version
    },
    timestamp: new Date()
  };

  logger.info('Health check', healthCheck);

  res.status(dbStatus === 1 ? 200 : 503).json(healthCheck);
});

// ===== ENHANCED ERROR HANDLING =====
// 404 Handler
app.use((req, res, next) => {
  logger.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    path: req.originalUrl,
    code: 'RESOURCE_NOT_FOUND'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500
  });

  // CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid CSRF token',
      code: 'INVALID_CSRF_TOKEN'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  const errorResponse = {
    status: 'error',
    message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
});

// ===== SERVER START =====
let server;

connectWithRetry().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    logger.info(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    logger.info(`🗄️  MongoDB URI: ${MONGODB_URI}`);
  });
}).catch(err => {
  logger.error('Failed to establish initial MongoDB connection:', err);
  process.exit(1);
});

// ===== ENHANCED PROCESS HANDLERS =====
process.on('SIGINT', async () => {
  logger.info('SIGINT received - shutting down gracefully');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  logger.info(`Created logs directory: ${logsDir}`);
}

module.exports = app;