import { Router } from 'express'
import { loginPengguna } from '../controllers/pengguna'
import rutePengguna from './pengguna'
import ruteKategori from './kategori'
import ruteProduk from './produk'
import rutePesanan from './pesanan'

const router = Router()

router.get('/', (req, res) => { res.json({ pesan: 'Selamat datang di API Toko Galery Navilla' }) })

router.post('/login', loginPengguna)

router.use('/pengguna', rutePengguna)
router.use('/kategori', ruteKategori)
router.use('/produk', ruteProduk)
router.use('/pesanan', rutePesanan)

export default router
