import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Ambil ORIGINS dari environment variable
const allowedOrigins = process.env.ORIGINS 
  ? process.env.ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:3000']; // Fallback untuk development

// Middlewares global
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (e.g., mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Cek apakah origin ada di daftar yang diizinkan
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// Routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ Allowed origins:', allowedOrigins);
});
