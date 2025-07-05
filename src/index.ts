import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import routes from './routes'

const app = express()
const PORT = process.env.PORT || 3001

// Ambil daftar origin dari environment variable ORIGINS (dipisah koma)
const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:3000']

// Middleware CORS dinamis
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // untuk Postman, curl, dll
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    console.warn('❌ CORS blocked:', origin)
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Middleware global lainnya
app.use(express.json())
app.use(cookieParser())
app.use(compression())

// Routing utama
app.use('/', routes)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('✅ Allowed origins:', allowedOrigins)
})
