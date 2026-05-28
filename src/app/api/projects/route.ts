import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Project from '@/models/Project';

// GET all projects
export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a project workspace
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Fallback ID generation similar to frontend uid()
    const customId = body.id || Math.random().toString(36).slice(2, 11);
    
    const newProject = await Project.create({
      id: customId,
      name: body.name,
      description: body.description || '',
      icon: body.icon || '🚀',
      color: body.color || '#6366f1',
      version: body.version || 'v1.0.0',
      category: body.category || 'Tech Based',
      sections: body.sections || []
    });

    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
