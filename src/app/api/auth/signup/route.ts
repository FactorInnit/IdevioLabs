import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        return NextResponse.json(
          { error: "This email uses Google sign-in. Continue with Google instead." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
