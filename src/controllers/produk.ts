import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const buatProduk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const produk = await prisma.produk.create({ data: req.body })
    res.status(201).json(produk)
  } catch (error) {
    next(error)
  }
}

export const ambilSemuaProduk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const produk = await prisma.produk.findMany({
      include: { kategori: true },
    })
    res.status(200).json(produk)
  } catch (error) {
    next(error)
  }
}

export const ambilProdukById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const produk = await prisma.produk.findUnique({
      where: { id },
      include: { kategori: true },
    })

    if (!produk) {
      res.status(404).json({ status: false, pesan: 'Produk tidak ditemukan.' })
      return
    }

    res.status(200).json(produk)
  } catch (error) {
    next(error)
  }
}

export const perbaruiProduk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = req.body

    const hasil = await prisma.produk.update({
      where: { id },
      data,
    })

    res.status(200).json({ status: true, pesan: 'Produk berhasil diperbarui.', data: hasil })
  } catch (error) {
    next(error)
  }
}

export const hapusProduk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.produk.delete({ where: { id } })
    res.status(204).json({ pesan: 'Produk berhasil dihapus.' })
  } catch (error) {
    next(error)
  }
}