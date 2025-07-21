import { clerkClient, getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
    console.log("🔵 [API] Masuk ke /api/updateRole");
    
    if (req.method !== "POST") {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Dapatkan userId dari request secara otomatis
    const { userId: requesterUserId } = getAuth(req);

    // 2. Jika tidak ada userId, hentikan.
    if (!requesterUserId) {
        console.log("🔴 [API] Pengguna tidak terotentikasi.");
        return res.status(401).json({ message: "Anda tidak terotentikasi." });
    }

    try {
        // 3. Dapatkan data user yang meminta
        const requesterUser = await clerkClient.users.getUser(requesterUserId);

        // 4. Cek role pengguna yang meminta
        if (requesterUser.publicMetadata?.role !== 'admin') {
            console.warn(`⚠️ [API] Pengguna ${requesterUserId} mencoba mengubah role tanpa izin admin.`);
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk melakukan aksi ini." });
        }

        // 5. Ambil data dari body request
        const { targetUserId, newRole } = req.body;
        
        if (!targetUserId || !newRole) {
            return res.status(400).json({ message: "Parameter targetUserId dan newRole wajib diisi." });
        }

        // 6. Panggil Clerk API untuk mengubah role
        console.log(`🟢 [API] Memanggil Clerk API untuk mengubah role...`);
        const updatedUser = await clerkClient.users.updateUser(targetUserId, {
            publicMetadata: {
                ...requesterUser.publicMetadata,
                role: newRole,
            },
        });

        console.log(`🟢 [API] Role berhasil diubah. Mengirim respon.`);
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