import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password. Try signing in with Google." },
        { status: 401 }
      );
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to sign in." }, { status: 500 });
  }
}
