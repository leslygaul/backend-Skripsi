import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Ambil ORIGINS dari environment variable
const allowedOrigins = process.env.ORIGINS 
  ? process.env.ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:3000']; // Fallback untuk development

// Konfigurasi CORS
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});