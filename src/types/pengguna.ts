export interface Pengguna {
    id: string
    nama?: string
    email: string
    peran?: 'ADMIN' | 'PENGGUNA'
    dibuatPada?: Date
    diperbarui?: Date
}

export type PayloadTokenPengguna = Pick<Pengguna, 'id' | 'email' | 'peran' | 'nama'>

declare global {
    namespace Express {
        interface Request {
            pengguna?: PayloadTokenPengguna
        }
    }
}
