import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import routes from './routes'

const app = express()
const PORT = process.env.PORT

const allowedOrigins = (process.env.ORIGINS).split(',');

const cleanOrigins = allowedOrigins.map(o => o.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    const formattedOrigin = origin?.replace(/\/$/, '');
    console.log('CORS check for:', formattedOrigin);

    if (!formattedOrigin || cleanOrigins.includes(formattedOrigin)) {
      callback(null, origin);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json())
app.use(cookieParser())
app.use(compression())
app.use('/', routes)

app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`)
})
