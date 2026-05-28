import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, Email, and Password are required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Hash the password for production security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Enforce admin role
    const role = "admin";
    const newUser = await User.create({
      id: `u-${Date.now()}`,
      name,
      email: normalized,
      password: hashedPassword,
      role,
      avatar: `https://i.pravatar.cc/150?u=${name}`,
    });

    // Don't send password back in response
    const { password: _, ...userData } = newUser.toObject();

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
