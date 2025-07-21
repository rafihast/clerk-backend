import { clerkClient } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId } = req.body;

    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "siswa" // atau default lainnya
        }
      });

      res.status(200).json({ message: "Role diberikan!" });
    } catch (err) {
      res.status(500).json({ error: "Gagal memberikan role default." });
    }
  }
}
