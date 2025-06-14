import express from 'express'
import {
  buatTransaksi,
  tanganiNotifikasiPembayaran,
  ambilSemuaPesanan,
  ambilPesananById,
} from '../controllers/pesanan'
import otentikasi from '../middlewares/otentikasi'
import otorisasiPeran from '../middlewares/otorisasiPeran'

const rutePesanan = express.Router()

rutePesanan.post('/', otentikasi, buatTransaksi)
rutePesanan.post('/notifikasi', tanganiNotifikasiPembayaran)

rutePesanan.get('/', otentikasi, otorisasiPeran(['ADMIN']), ambilSemuaPesanan)
rutePesanan.get('/:id', otentikasi, otorisasiPeran(['ADMIN']), ambilPesananById)

export default rutePesanan;