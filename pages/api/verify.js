// pages/api/verify.js
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  // CORS headers (jika dibutuhkan)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log("🔵 [API] Masuk ke /api/verify (update role)");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Ambil session & user yang memanggil
  const { userId: requesterUserId } = getAuth(req);
  if (!requesterUserId) {
    console.log("🔴 [API] Pengguna tidak terotentikasi.");
    return res.status(401).json({ message: 'Anda tidak terotentikasi.' });
  }

  try {
    // 2. Cek apakah requester punya role admin
    const requester = await clerkClient.users.getUser(requesterUserId);
    if (requester.publicMetadata?.role !== 'admin') {
      console.warn(`⚠️ [API] User ${requesterUserId} bukan admin. Tidak melakukan perubahan role.`);
      // Mengganti error 403 dengan respons sukses 200, tanpa melakukan update role.
      // Ini memenuhi permintaan untuk menghilangkan pesan error jika bukan admin,
      // sambil tetap mencegah non-admin melakukan perubahan role.
      return res.status(200).json({
        message: 'Anda tidak memiliki izin untuk mengubah role, namun permintaan berhasil diproses tanpa perubahan.',
        user: { id: requester.id, role: requester.publicMetadata.role } // Mengembalikan informasi user yang meminta
      });
    }

    // 3. Ambil body
    const { targetUserId, newRole } = req.body;
    if (!targetUserId || !newRole) {
      return res.status(400).json({ message: 'Parameter targetUserId dan newRole wajib diisi.' });
    }

    // 4. Update role via Clerk
    console.log(`🟢 [API] Mengubah role ${targetUserId} → ${newRole}`);
    const updatedUser = await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: { ...requester.publicMetadata, role: newRole }
    });

    // 5. Balas sukses
    console.log("🟢 [API] Sukses mengubah role.");
    return res.status(200).json({
      message: `Role user ${updatedUser.id} berhasil diubah menjadi ${newRole}.`,
      user: { id: updatedUser.id, role: updatedUser.publicMetadata.role }
    });

  } catch (err) {
    console.error("🔴 [API] Error:", err);
    return res.status(500).json({ message: 'Gagal memproses request.' });
  }
}
