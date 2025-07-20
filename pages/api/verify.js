import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function handler(req, res) {
  console.log("🔵 [API] Request masuk ke /api/verify (FINAL DEBUG TOKEN)");

  if (req.method !== "POST") {
    console.warn("🟡 [API] Method bukan POST. Method:", req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let body;
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error("🔴 [API] Gagal parsing JSON body (string). Error:", e);
      return res.status(400).json({ message: "Invalid JSON body" });
    }
  } else {
    body = req.body;
  }
  body = body || {};
  
  console.log("➡️ [API] Body yang diterima (mentah):", req.body);
  console.log("✅ [API] Parsed Body:", body);

  const { action, token, targetUserId, newRole } = body;

  // --- DEBUGGING: LOG TOKEN PENUH DI SINI ---
  console.log("🟢 [API] TOKEN PENUH YANG DITERIMA:", token); 
  // --- AKHIR DEBUGGING LOG TOKEN PENUH ---

  if (!token) {
    console.error("🔴 [API] Token tidak ditemukan di body request setelah parsing.");
    return res.status(400).json({ message: 'Token diperlukan.' });
  }
  
  let session;
  try {
    console.log("🟢 [API] Mencoba memverifikasi sesi dengan token (dengan leeway 60 detik)...");
    session = await clerkClient.sessions.verifySession(token, { leeway: 60 }); 
    console.log("✅ [API] Sesi berhasil diverifikasi. userId:", session.userId);
  } catch (err) {
    console.error("🔴 [API] Error memverifikasi sesi:", err.message);
    console.error("🔴 [API] Detail Error Clerk (dengan leeway):", JSON.stringify(err, null, 2)); 
    return res.status(401).json({ message: 'Invalid token' });
  }

  const actingUser = await clerkClient.users.getUser(session.userId);

  if (action === 'verify') {
    return res.status(200).json({
      userId: session.userId,
      email: actingUser.emailAddresses[0].emailAddress,
      firstName: actingUser.firstName,
      lastName: actingUser.lastName,
      role: actingUser.publicMetadata.role || 'siswa' 
    });
  } 
  else if (action === 'updateRole') {
    if (session.userId !== targetUserId) {
        return res.status(403).json({ message: 'Anda tidak memiliki izin.' });
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
      console.error('🔴 [API] Error saat memperbarui role:', error);
      return res.status(500).json({ message: 'Gagal memperbarui role.' });
    }
  } 
  else {
    return res.status(400).json({ message: 'Aksi tidak valid.' });
  }
}
