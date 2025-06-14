import { Request, Response, NextFunction } from 'express'

const otorisasiPeran = (daftarPeran: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const peran = req.pengguna?.peran

    if (!peran || !daftarPeran.includes(peran)) {
      res.status(403).json({ pesan: 'Akses ditolak: Hak akses tidak mencukupi.' })
      return
    }

    next()
  }
}

export default otorisasiPeran
