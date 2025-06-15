import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import routes from './routes';

const app = express();

// Validate required environment variables
if (!process.env.PORT) {
  throw new Error('PORT environment variable is required');
}

if (!process.env.ORIGINS) {
  throw new Error('ORIGINS environment variable is required (comma-separated list of allowed origins)');
}

const PORT = process.env.PORT;

// Process allowed origins with safety checks
const allowedOrigins = process.env.ORIGINS
  .split(',')
  .map(o => o.trim())
  .filter(o => o.length > 0) // Remove empty strings
  .map(o => o.replace(/\/$/, '')); // Remove trailing slashes

if (allowedOrigins.length === 0) {
  console.warn('Warning: No valid origins provided in ORIGINS environment variable');
}

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const formattedOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(formattedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Standard middleware
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// Routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});