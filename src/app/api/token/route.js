import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

// Better Auth session dekhe JWT toiri kore (same domain, tai cookie pawa jay)
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ message: "Please login first." }, { status: 401 });
    }

    // Server-er verifyToken ei payload-i ashha kore
    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    return Response.json({
      message: "JWT created successfully!",
      token,
      user,
    });
  } catch (error) {
    console.warn("JWT Creation Error:", error);

    return Response.json({ message: "Failed to create JWT." }, { status: 500 });
  }
}
