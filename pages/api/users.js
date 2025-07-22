// pages/api/users.js (VERSI DENGAN PENGECKAN ADMIN)
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'GET') { return res.status(405).json({ message: 'Method Not Allowed' }); }

  const { userId: requesterUserId } = getAuth(req);
  if (!requesterUserId) { return res.status(401).json({ message: 'Anda tidak terotentikasi.' }); }

  try {
    const requester = await clerkClient.users.getUser(requesterUserId);
    if (requester.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin.' });
    }

    const users = await clerkClient.users.getUserList();
    const userData = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'N/A',
      fullName: user.firstName + ' ' + user.lastName || 'N/A',
      role: user.publicMetadata?.role || 'user',
    }));
    return res.status(200).json(userData);
  } catch (err) {
    console.error("🔴 [API] Error:", err);
    return res.status(500).json({ message: 'Gagal memproses request.' });
  }
}