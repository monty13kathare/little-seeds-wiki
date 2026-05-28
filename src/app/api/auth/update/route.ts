import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/Admin';

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const { id, name, email, avatar, preferences } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Find the user in our database
    const user = await User.findOne({ id });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Validate email uniqueness if changing email
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 409 });
      }
      user.email = normalizedEmail;
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    
    // Update preferences if provided
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    await user.save();

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
