import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token } = req.body;

  try {
    const session = await clerkClient.sessions.verifySession(token);
    const userId = session.userId;

    const user = await clerkClient.users.getUser(userId);

    return res.status(200).json({
      userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    console.error("Error verifying session:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
