import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/Admin';

// GET all client users
export async function GET() {
  try {
    await connectToDatabase();
    // Fetch all non-admin users (CLIENT or user role) so we can see & reassign them
    const users = await User.find({ role: { $in: ['CLIENT', 'user'] } }).sort({ createdAt: -1 });
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      assignedProjectId: u.assignedProjectId || null,
      createdAt: u.createdAt,
    }));
    return NextResponse.json({ success: true, data: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a new client user
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, assignedProjectId } = body;

    if (!name || !email || !password || !assignedProjectId) {
      return NextResponse.json({ success: false, message: 'Name, email, password, and project are required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A user with this email already exists.' }, { status: 409 });
    }

    const newUser = await User.create({
      id: `client-${Date.now()}`,
      name,
      email: normalized,
      role: 'CLIENT',
      password,
      assignedProjectId,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        assignedProjectId: newUser.assignedProjectId || null,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH update an existing client user
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, email, password, assignedProjectId } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    // Build the update object explicitly
    const updates: Record<string, any> = {};
    if (name !== undefined)              updates.name = name.trim();
    if (email !== undefined)             updates.email = email.toLowerCase().trim();
    if (password !== undefined && password !== '') updates.password = password;
    // assignedProjectId: always write it — null means unassign
    if (assignedProjectId !== undefined) {
      updates.assignedProjectId = assignedProjectId === '' ? null : assignedProjectId;
    }
    // Always ensure role stays CLIENT
    updates.role = 'CLIENT';

    // Use updateOne with custom `id` field (NOT _id)
    const result = await User.updateOne({ id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    // Fetch fresh copy to return
    const updated = await User.findOne({ id });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Failed to retrieve updated user.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        assignedProjectId: updated.assignedProjectId || null,
        avatar: updated.avatar,
        createdAt: updated.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a client user
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: 'ID required.' }, { status: 400 });
    await User.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
