import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const buatPengguna = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nama, email, sandi, peran } = req.body

        const pengguna = await prisma.pengguna.findUnique({ where: { email } })
        if (pengguna) {
            res.status(400).json({ status: false, pesan: 'Email sudah terdaftar.' })
            return
        }

        const sandiTerenkripsi = await bcrypt.hash(sandi, 10)

        const hasil = await prisma.pengguna.create({
            data: {
                nama,
                email,
                sandi: sandiTerenkripsi,
                peran,
            },
        })

        const { sandi: _, ...data } = hasil

        res.status(201).json({
            status: true,
            pesan: 'Pengguna berhasil dibuat.',
            data,
        })
    } catch (error) {
        next(error)
    }
}

export const ambilSemuaPengguna = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pengguna = await prisma.pengguna.findMany({
            select: {
                id: true,
                nama: true,
                email: true,
                peran: true,
                dibuatPada: true,
                diperbarui: true,
            },
        })

        res.status(200).json({
            status: true,
            pesan: 'Data pengguna berhasil diambil.',
            data: pengguna,
        })
    } catch (error) {
        next(error)
    }
}

export const ambilPenggunaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userid } = req.params

        const pengguna = await prisma.pengguna.findUnique({
            where: { id: userid },
            select: {
                id: true,
                nama: true,
                email: true,
                dibuatPada: true,
                diperbarui: true,
            },
        })

        if (!pengguna) {
            res.status(404).json({ status: false, pesan: 'Pengguna tidak ditemukan.' })
            return
        }

        res.status(200).json({
            status: true,
            pesan: 'Data pengguna berhasil diambil.',
            data: pengguna,
        })
    } catch (error) {
        next(error)
    }
}

export const hapusPengguna = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userid } = req.params

        const pengguna = await prisma.pengguna.findUnique({ where: { id: userid } })
        if (!pengguna) {
            res.status(404).json({ status: false, pesan: 'Pengguna tidak ditemukan.' })
            return
        }

        await prisma.pengguna.delete({ where: { id: userid } })

        res.status(200).json({
            status: true,
            pesan: 'Pengguna berhasil dihapus.',
        })
    } catch (error) {
        next(error)
    }
}

export const perbaruiPengguna = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userid } = req.params

        const pengguna = await prisma.pengguna.findUnique({ where: { id: userid } })
        if (!pengguna) {
            res.status(404).json({ status: false, pesan: 'Pengguna tidak ditemukan.' })
            return
        }

        const { sandi, ...dataLainnya } = req.body
        const dataUpdate: any = { ...dataLainnya }

        if (sandi) {
            dataUpdate.sandi = await bcrypt.hash(sandi, 10)
        }

        const hasil = await prisma.pengguna.update({
            where: { id: userid },
            data: dataUpdate,
            select: {
                id: true,
                nama: true,
                email: true,
                dibuatPada: true,
                diperbarui: true,
            },
        })

        res.status(200).json({
            status: true,
            pesan: 'Pengguna berhasil diperbarui.',
            data: hasil,
        })
    } catch (error) {
        next(error)
    }
}

export const loginPengguna = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, sandi } = req.body

    if (!email || !sandi) {
        res.status(400).json({ pesan: 'Email dan sandi wajib diisi.' })
        return
    }

    try {
        const pengguna = await prisma.pengguna.findUnique({ where: { email } })
        if (!pengguna) {
            res.status(401).json({ pesan: 'Email atau sandi salah.' })
            return
        }

        const cocok = await bcrypt.compare(sandi, pengguna.sandi)
        if (!cocok) {
            res.status(401).json({ pesan: 'Email atau sandi salah.' })
            return
        }

        const token = jwt.sign(
            {
                id: pengguna.id,
                email: pengguna.email,
                peran: pengguna.peran,
                nama: pengguna.nama,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '2y' }
        )

        res.status(200).json({ token, pesan: 'Login berhasil.' })
    } catch (error) {
        next(error)
    }
}