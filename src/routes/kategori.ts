import express from 'express'
import {
  buatKategori,
  ambilSemuaKategori,
  ambilKategoriById,
  perbaruiKategori,
  hapusKategori,
} from '../controllers/kategori'
import otentikasi from '../middlewares/otentikasi'
import otorisasiPeran from '../middlewares/otorisasiPeran'

const router = express.Router()

router.post(
  '',
  otentikasi,
  otorisasiPeran(['ADMIN']),
  buatKategori
)

router.get('', ambilSemuaKategori)
router.get('/:id', ambilKategoriById)

router.patch(
  '/:id',
  otentikasi,
  otorisasiPeran(['ADMIN']),
  perbaruiKategori
)

router.delete('/:id', otentikasi, otorisasiPeran(['ADMIN']), hapusKategori)

export default router;