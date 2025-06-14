import { Router } from 'express'
import {
    buatPengguna,
    hapusPengguna,
    ambilPenggunaById,
    ambilSemuaPengguna,
    perbaruiPengguna,
} from '../controllers/pengguna'
import otentikasi from '../middlewares/otentikasi'
import otorisasiPeran from '../middlewares/otorisasiPeran'

const rutePengguna = Router()

rutePengguna
    .get('', otentikasi, otorisasiPeran(['ADMIN']), ambilSemuaPengguna)
    .post('', buatPengguna)
    .get('/:userid', otentikasi, otorisasiPeran(['ADMIN']), ambilPenggunaById)
    .patch('/:userid', otentikasi, otorisasiPeran(['ADMIN']), perbaruiPengguna)
    .delete('/:userid', otentikasi, otorisasiPeran(['ADMIN']), hapusPengguna)

export default rutePengguna;