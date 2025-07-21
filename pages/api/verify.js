import { clerkClient } from '@clerk/nextjs/server';
import { verifySessionToken } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  console.log("🔵 [API] Masuk ke /api/verify");

  if (req.method !== "POST") {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sessionToken = req.headers.authorization?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ message: "Token tidak ditemukan di Authorization header." });
  }

  try {
    // Verifikasi token
    const session = await verifySessionToken(sessionToken);
    const userId = session.userId;

    // Ambil data user dari Clerk
    const user = await clerkClient.users.getUser(userId);

    // Kirim data user sebagai respon
    return res.status(200).json({
      userId,
      email: user.emailAddresses?.[0]?.emailAddress || "",
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata.role || "siswa"
    });

  } catch (error) {
    console.error("🔴 [API] Error saat verifikasi token:", error);
    return res.status(401).json({ message: "Token tidak valid atau sesi telah berakhir." });
  }
}
