// File: /pages/api/updateRole.js (untuk Next.js API Route)

import { clerkClient } from '@clerk/nextjs/server';
import { verifySessionToken } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
    console.log("🔵 [API] Masuk ke /api/updateRole");

    // Pastikan request method adalah POST
    if (req.method !== "POST") {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Ambil token dari Authorization header
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");
    if (!sessionToken) {
        return res.status(401).json({ message: "Token tidak ditemukan." });
    }

    try {
        // 1. Verifikasi token untuk mendapatkan ID pengguna yang meminta
        const session = await verifySessionToken(sessionToken);
        const requesterUserId = session.userId; // ID pengguna yang sedang login (admin)

        // 2. Ambil data pengguna yang meminta
        const requesterUser = await clerkClient.users.getUser(requesterUserId);

        // 3. **PENTING**: Cek apakah pengguna yang meminta memiliki role 'admin'
        if (requesterUser.publicMetadata?.role !== 'admin') {
            console.warn(`⚠️ [API] Pengguna ${requesterUserId} mencoba mengubah role tanpa izin admin.`);
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk melakukan aksi ini." });
        }

        // 4. Ambil data dari body request (target pengguna dan role baru)
        const { targetUserId, newRole } = req.body;
        console.log(`[API] Admin ${requesterUserId} akan mengubah role user ${targetUserId} menjadi ${newRole}`);
        
        if (!targetUserId || !newRole) {
            return res.status(400).json({ message: "Parameter targetUserId dan newRole wajib diisi." });
        }

        // 5. Panggil Clerk Backend API untuk mengubah role pengguna target
        const updatedUser = await clerkClient.users.updateUser(targetUserId, {
            publicMetadata: {
                ...requesterUser.publicMetadata, // Pertahankan metadata yang ada
                role: newRole,
            },
        });

        // 6. Kirim respon sukses
        return res.status(200).json({
            message: `Role pengguna ${updatedUser.id} berhasil diubah menjadi ${newRole}.`,
            user: {
                id: updatedUser.id,
                role: updatedUser.publicMetadata.role,
            }
        });

    } catch (error) {
        console.error("🔴 [API] Error saat memproses request:", error);
        return res.status(500).json({ message: "Gagal memproses request." });
    }
}