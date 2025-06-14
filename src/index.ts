import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import routes from './routes'

const app = express()
const PORT = process.env.PORT

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(compression())
app.use('/', routes)

app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`)
})
