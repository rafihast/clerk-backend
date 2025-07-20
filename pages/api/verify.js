import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function handler(req, res) {
  console.log("🔵 [API] Masuk ke /api/verify"); // Untuk cek apakah request masuk

  if (req.method !== "POST") {
    console.warn("🟡 [API] Method bukan POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token } = req.body;
  console.log("🟢 [API] Token dari body:", token); // Lihat token yang dikirim

  try {
    const session = await clerkClient.sessions.verifySession(token);
    const userId = session.userId;

    console.log("🟢 [API] Session valid. userId:", userId);

    const user = await clerkClient.users.getUser(userId);

    console.log("🟢 [API] Data user:", {
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return res.status(200).json({
      userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    console.error("🔴 [API] Error verifying session:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
