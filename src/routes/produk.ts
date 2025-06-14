import express from 'express'
import {
  buatProduk,
  ambilSemuaProduk,
  ambilProdukById,
  perbaruiProduk,
  hapusProduk,
} from '../controllers/produk'
import otentikasi from '../middlewares/otentikasi'
import otorisasiPeran from '../middlewares/otorisasiPeran'

const ruteProduk = express.Router()

ruteProduk.post(
  '',
  otentikasi,
  otorisasiPeran(['ADMIN']),
  buatProduk
)

ruteProduk.get('', ambilSemuaProduk)
ruteProduk.get('/:id', ambilProdukById)

ruteProduk.patch(
  '/:id',
  otentikasi,
  otorisasiPeran(['ADMIN']),
  perbaruiProduk
)

ruteProduk.delete(
  '/:id',
  otentikasi,
  otorisasiPeran(['ADMIN']),
  hapusProduk
)

export default ruteProduk
