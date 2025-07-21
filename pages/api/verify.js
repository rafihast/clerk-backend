// File: pages/api/verify.js
import { clerkClient, getAuth } from "@clerk/nextjs/server"; // ✅ Gunakan getAuth dari nextjs/server

export default async function handler(req, res) {
  console.log("🔵 [API] Request masuk ke /api/verify");

  if (req.method !== "POST") {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ✅ Ambil userId dari getAuth, bukan dari middleware
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Pengguna tidak terautentikasi." });
  }

  let actingUser;
  try {
    actingUser = await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error("🔴 [API] Gagal mengambil data user:", error);
    return res.status(500).json({ message: "Gagal mengambil data user." });
  }

  const { action, targetUserId, newRole } = req.body;

  if (action === 'verify') {
    return res.status(200).json({
      userId,
      email: actingUser.emailAddresses[0]?.emailAddress || '',
      firstName: actingUser.firstName,
      lastName: actingUser.lastName,
      role: actingUser.publicMetadata.role || 'siswa'
    });
  }

  if (action === 'updateRole') {
    const actingUserRole = actingUser.publicMetadata.role;

    if (actingUserRole !== 'admin' && userId !== targetUserId) {
      return res.status(403).json({ message: 'Akses ditolak. Bukan admin dan bukan user yang bersangkutan.' });
    }

    if (!targetUserId || !newRole) {
      return res.status(400).json({ message: 'ID user dan role baru diperlukan.' });
    }

    try {
      await clerkClient.users.updateUser(targetUserId, {
        publicMetadata: { role: newRole },
      });
      return res.status(200).json({ success: true, message: 'Role berhasil diubah.' });
    } catch (error) {
      console.error('🔴 [API] Error saat memperbarui role:', error);
      return res.status(500).json({ message: 'Gagal memperbarui role.' });
    }
  }

  return res.status(400).json({ message: 'Aksi tidak valid.' });
}
