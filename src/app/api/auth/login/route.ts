import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/Admin";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-production-key-here-12345";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();
    const dbUser = await User.findOne({ email: normalized });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Check if the user is actually an admin
    if (dbUser.role !== "admin" && dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin users can log in." },
        { status: 403 },
      );
    }

    // Verify password (handle both hashed and old plain text passwords for transition)
    let isPasswordValid = false;
    const isHashed = dbUser.password && (
      dbUser.password.startsWith("$2a$") || 
      dbUser.password.startsWith("$2b$") || 
      dbUser.password.startsWith("$2y$")
    );

    if (isHashed) {
      // Hashed password
      isPasswordValid = await bcrypt.compare(password, dbUser.password);
    } else {
      // Old plaintext fallback
      isPasswordValid = dbUser.password === password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = await new SignJWT({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Create the response and set HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        avatar: dbUser.avatar,
      },
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
