import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const buatKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const kategori = await prisma.kategori.create({ data: req.body })
        res.status(201).json(kategori)
    } catch (error) {
        next(error)
    }
}

export const ambilSemuaKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const kategori = await prisma.kategori.findMany()
        res.status(200).json(kategori)
    } catch (error) {
        next(error)
    }
}

export const ambilKategoriById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const kategori = await prisma.kategori.findUnique({
            where: { id },
            include: { produk: true },
        })

        if (!kategori) {
            res.status(404).json({ pesan: 'Kategori dengan ID tersebut tidak ditemukan.' })
            return
        }

        res.status(200).json(kategori)
    } catch (error) {
        next(error)
    }
}

export const perbaruiKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const data = req.body

        const kategori = await prisma.kategori.findUnique({ where: { id } })
        if (!kategori) {
            res.status(404).json({ pesan: 'Kategori dengan ID tersebut tidak ditemukan.' })
            return
        }

        const hasil = await prisma.kategori.update({
            where: { id },
            data,
        })

        res.status(200).json({ pesan: 'Kategori berhasil diperbarui.', data: hasil })
    } catch (error) {
        next(error)
    }
}

export const hapusKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const kategori = await prisma.kategori.findUnique({ where: { id } })

        if (!kategori) {
            res.status(404).json({ pesan: 'Kategori dengan ID tersebut tidak ditemukan.' })
            return
        }

        await prisma.kategori.delete({ where: { id } })
        res.status(204).json({ pesan: 'Kategori berhasil dihapus.' })
    } catch (error) {
        next(error)
    }
}