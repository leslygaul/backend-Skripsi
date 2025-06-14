import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PayloadTokenPengguna } from '../types/pengguna'

const otentikasi = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
        res.status(401).json({ pesan: 'Akses ditolak. Token tidak ditemukan.' })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as PayloadTokenPengguna
        req.pengguna = decoded
        next()
    } catch (err) {
        res.status(400).json({ pesan: 'Token tidak valid.' })
        return
    }
}

export default otentikasi
