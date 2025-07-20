// File: pages/api/verify.js
import { clerkClient } from "@clerk/clerk-sdk-node";
import { withAuth } from '@clerk/nextjs'; 
// PASTIKAN ANDA SUDAH MENGINSTAL @clerk/nextjs DI PROYEK BACKEND VERCEL ANDA:
// npm install @clerk/nextjs
// ATAU pastikan sudah ada di package.json dan lakukan 'npm install' lalu push ke Git.

// Ubah fungsi handler Anda agar di-wrap oleh withAuth
const handler = async (req, res) => {
  console.log("🔵 [API] Request masuk ke /api/verify (Final Versi)");

  if (req.method !== "POST") {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { action, token, targetUserId, newRole } = req.body;

  // Verifikasi otomatis oleh withAuth telah selesai.
  // req.auth sekarang berisi informasi sesi yang sudah divalidasi.
  const { userId } = req.auth;
  
  if (!userId) {
    // Ini seharusnya tidak terjadi jika withAuth bekerja dengan benar
    // dan user sudah terautentikasi.
    return res.status(401).json({ message: "Pengguna tidak terautentikasi." });
  }

  // Logika sekarang jauh lebih sederhana karena kita tidak perlu memverifikasi token secara manual
  const actingUser = await clerkClient.users.getUser(userId);

  if (action === 'verify') {
    return res.status(200).json({
      userId,
      email: actingUser.emailAddresses[0].emailAddress,
      firstName: actingUser.firstName,
      lastName: actingUser.lastName,
      role: actingUser.publicMetadata.role || 'siswa' 
    });
  } 
  else if (action === 'updateRole') {
    const actingUserRole = actingUser.publicMetadata.role;

    // Logika otorisasi:
    // 1. Jika user adalah admin, dia bisa mengubah role siapa saja.
    // 2. Jika user bukan admin, dia hanya bisa mengubah role dirinya sendiri (untuk default 'siswa').
    if (actingUserRole !== 'admin' && userId !== targetUserId) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin admin untuk mengubah role user lain.' });
    }
    
    // Validasi data yang diperlukan
    if (!targetUserId || !newRole) {
        return res.status(400).json({ message: 'ID user dan role baru diperlukan.' });
    }

    try {
      await clerkClient.users.updateUser(targetUserId, {
        publicMetadata: {
          role: newRole,
        },
      });
      return res.status(200).json({ success: true, message: 'Role berhasil diubah.' });
    } catch (error) {
      console.error('🔴 [API] Error saat memperbarui role:', error);
      return res.status(500).json({ message: 'Gagal memperbarui role.' });
    }
  } 
  else {
    return res.status(400).json({ message: 'Aksi tidak valid.' });
  }
};

// Ekspor handler yang dibungkus dengan withAuth
export default withAuth(handler);
