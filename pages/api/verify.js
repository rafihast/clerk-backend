import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function handler(req, res) {
  console.log("🔵 [API] Masuk ke /api/verify (Combined Endpoint)");

  if (req.method !== "POST") {
    console.warn("🟡 [API] Method bukan POST. Method:", req.method);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { action, token, targetUserId, newRole } = req.body;

  console.log("🟢 [API] Data diterima:", { action, token: token ? "Ada" : "Tidak ada", targetUserId, newRole });

  // Verifikasi token untuk semua aksi yang membutuhkan otentikasi
  if (!token) {
    console.error("🔴 [API] Token tidak ada di request body.");
    return res.status(400).json({ message: "Token diperlukan." });
  }

  let session;
  let actingUser;
  try {
    session = await clerkClient.sessions.verifySession(token);
    actingUser = await clerkClient.users.getUser(session.userId);
    console.log("✅ [API] Sesi valid. User ID:", session.userId);
  } catch (err) {
    console.error("🔴 [API] Error memverifikasi sesi:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

  // Logika berdasarkan 'action' yang diminta
  if (action === 'verify') {
    // Logika asli untuk verifikasi token
    console.log("🟢 [API] Melakukan aksi: verify");
    return res.status(200).json({
      userId: session.userId,
      email: actingUser.emailAddresses[0].emailAddress,
      firstName: actingUser.firstName,
      lastName: actingUser.lastName,
      // Anda bisa juga sertakan role di sini jika diperlukan oleh frontend
      role: actingUser.publicMetadata.role || 'siswa' 
    });
  } 
  else if (action === 'updateRole') {
    // Logika untuk mengubah role
    console.log("🟢 [API] Melakukan aksi: updateRole");

    // Pastikan hanya admin yang bisa mengubah role orang lain
    const actingUserRole = actingUser.publicMetadata.role;
    if (actingUserRole !== 'admin' && session.userId !== targetUserId) {
        console.warn("🟡 [API] User bukan admin dan mencoba mengubah role user lain. Role:", actingUserRole);
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin.' });
    }
    
    // Jika user mencoba mengubah role dirinya sendiri, pastikan hanya ke 'siswa' jika belum punya role
    // Ini adalah logika untuk user baru yang login dan otomatis diberi role 'siswa'
    if (session.userId === targetUserId && !actingUser.publicMetadata.role && newRole === 'siswa') {
        // Izinkan user baru untuk diberi role 'siswa' secara otomatis
        console.log("🟢 [API] Memberikan role default 'siswa' ke user baru:", targetUserId);
    } else if (actingUserRole !== 'admin') {
        // Jika bukan admin, user tidak boleh mengubah role dirinya sendiri atau orang lain
        // Kecuali kasus pemberian role 'siswa' otomatis di atas
        console.warn("🟡 [API] User non-admin mencoba mengubah role secara tidak sah.");
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah role.' });
    }


    if (!targetUserId || !newRole) {
      console.error("🔴 [API] Data tidak lengkap untuk updateRole. targetUserId:", targetUserId, "newRole:", newRole);
      return res.status(400).json({ message: 'ID user dan role baru diperlukan untuk updateRole.' });
    }

    try {
      await clerkClient.users.updateUser(targetUserId, {
        publicMetadata: {
          role: newRole,
        },
      });
      console.log(`✅ [API] Role berhasil diubah untuk user ${targetUserId} menjadi ${newRole}`);
      return res.status(200).json({ success: true, message: 'Role berhasil diubah.' });
    } catch (error) {
      console.error('🔴 [API] Error saat memperbarui role di Clerk:', error.message);
      return res.status(500).json({ message: 'Gagal memperbarui role.' });
    }
  } 
  else {
    console.warn("🟡 [API] Aksi tidak dikenal:", action);
    return res.status(400).json({ message: 'Aksi tidak valid.' });
  }
}
