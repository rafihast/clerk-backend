// pages/api/users.js
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  // CORS headers (jika dibutuhkan)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log("🔵 [API] Masuk ke /api/users (ambil daftar user)");

  if (req.method !== 'GET') {
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
      console.warn(`⚠️ [API] User ${requesterUserId} bukan admin.`);
      return res.status(403).json({ message: 'Anda tidak memiliki izin.' });
    }

    // 3. Ambil semua pengguna dari Clerk
    console.log("🟢 [API] Mengambil daftar pengguna...");
    const users = await clerkClient.users.getUserList();

    // 4. Proses data untuk respon
    const userData = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'N/A',
      fullName: user.firstName + ' ' + user.lastName || 'N/A',
      role: user.publicMetadata?.role || 'user',
    }));

    // 5. Balas dengan data pengguna
    console.log("🟢 [API] Sukses mengambil daftar pengguna.");
    return res.status(200).json(userData);

  } catch (err) {
    console.error("🔴 [API] Error:", err);
    return res.status(500).json({ message: 'Gagal memproses request.' });
  }
}