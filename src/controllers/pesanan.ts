import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import midtransClient from "midtrans-client";
import { StatusPembayaran } from "@prisma/client";
import { customAlphabet } from 'nanoid'
import dayjs from 'dayjs'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10);

export function ambilStatusPembayaran(
  transactionStatus: string,
  fraudStatus: string
): StatusPembayaran {
  switch (transactionStatus) {
    case 'capture':
      return fraudStatus === 'accept' ? 'PAID' : 'FAILED';
    case 'settlement':
      return 'PAID';
    case 'deny':
    case 'expire':
    case 'cancel':
      return 'FAILED';
    case 'pending':
    default:
      return 'PENDING';
  }
}

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

const buatIdPesanan = () => {
  const tanggal = dayjs().format('YYYYMMDD')
  return `PES-${tanggal}-${nanoid()}`
}

export const buatTransaksi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const penggunaId = req.pengguna?.id
    const { items, ...pelanggan } = req.body

    if (!penggunaId) throw createError(401, 'Pengguna belum terautentikasi.')
    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, 'Daftar produk tidak boleh kosong.')
    }

    const produkList = await prisma.produk.findMany({
      where: { id: { in: items.map(i => i.id) } },
      select: { id: true, nama: true, harga: true, jumlah: true },
    })

    const validasiItem = items.map(item => {
      const produk = produkList.find(p => p.id === item.id)
      if (!produk) throw createError(400, `Produk ${item.id} tidak ditemukan.`)
      if (item.jumlah > produk.jumlah) throw createError(400, `Stok tidak cukup untuk ${produk.nama}.`)
      return {
        ...item,
        produkId: produk.id,
        namaProduk: produk.nama,
        harga: produk.harga,
      }
    })

    const totalHarga = validasiItem.reduce((t, i) => t + i.harga * i.jumlah, 0)
    const idPesanan = buatIdPesanan();

    const transaksi = await snap.createTransaction({
      transaction_details: { order_id: idPesanan, gross_amount: totalHarga },
      item_details: validasiItem.map(i => ({
        id: i.produkId,
        name: i.namaProduk,
        price: i.harga,
        quantity: i.jumlah,
      })),
      customer_details: {
        first_name: pelanggan.namaDepan,
        last_name: pelanggan.namaBelakang,
        email: pelanggan.email,
        phone: pelanggan.telepon,
        billing_address: {
          address: pelanggan.alamat,
          city: pelanggan.kota,
          postal_code: pelanggan.kodePos,
        },
      },
    })

    const pesanan = await prisma.pesanan.create({
      data: {
        id: idPesanan,
        penggunaId,
        namaDepan: pelanggan.namaDepan,
        namaBelakang: pelanggan.namaBelakang,
        email: pelanggan.email,
        alamat: pelanggan.alamat,
        kota: pelanggan.kota,
        provinsi: pelanggan.provinsi,
        kodePos: pelanggan.kodePos,
        telepon: pelanggan.telepon,
        catatan: pelanggan.catatan,
        totalHarga,
        statusPembayaran: 'PENDING',
        tokenSnap: transaksi.token,
        itemPesanan: {
          create: validasiItem.map(i => ({
            produkId: i.produkId,
            harga: i.harga,
            jumlah: i.jumlah,
          })),
        },
      },
    })

    res.status(201).json({
      idPesanan: pesanan.id,
      token: transaksi.token,
      redirectUrl: transaksi.redirect_url,
    })
  } catch (error) {
    next(error)
  }
}

export const tanganiNotifikasiPembayaran = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { order_id: idPesanan, transaction_status, fraud_status } = req.body

    const statusPembayaran = ambilStatusPembayaran(transaction_status, fraud_status)

    const pesanan = await prisma.pesanan.update({
      where: { id: idPesanan },
      data: { statusPembayaran, diperbarui: new Date() },
      include: { pengguna: true, itemPesanan: true },
    })

    if (statusPembayaran === 'PAID') {
      await Promise.all(
        pesanan.itemPesanan.map(item =>
          prisma.produk.update({
            where: { id: item.produkId },
            data: { jumlah: { decrement: item.jumlah } },
          })
        )
      )
    }

    res.status(200).send('OK')
  } catch (error) {
    next(error)
  }
}

export const ambilSemuaPesanan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pesanan = await prisma.pesanan.findMany({
      include: {
        itemPesanan: {
          include: {
            produk: { select: { nama: true } },
          },
        },
      },
    })

    res.status(200).json({
      status: true,
      pesan: 'Data pesanan berhasil diambil.',
      data: pesanan,
    })
  } catch (error) {
    next(error)
  }
}

export const ambilPesananById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const pesanan = await prisma.pesanan.findUnique({
      where: { id },
      include: {
        itemPesanan: {
          include: {
            produk: { select: { nama: true } },
          },
        },
      },
    })

    if (!pesanan) {
      res.status(404).json({ status: false, pesan: 'Pesanan tidak ditemukan.' })
      return
    }

    res.status(200).json({
      status: true,
      pesan: 'Pesanan berhasil diambil.',
      data: pesanan,
    })
  } catch (error) {
    next(error)
  }
}

