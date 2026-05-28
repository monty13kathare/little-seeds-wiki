import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Document from '@/models/Document';

// GET all documents
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    
    const filter: any = {};
    if (role && role !== 'admin' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      filter.status = 'published';
    }
    
    const documents = await Document.find(filter).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a document/manual
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const customId = body.id || Math.random().toString(36).slice(2, 11);

    const newDocument = await Document.create({
      id: customId,
      folderId: body.folderId || null,
      parentId: body.parentId || null,
      projectId: body.projectId || null,
      title: body.title || 'Untitled Document',
      content: body.content || '{"type":"doc","content":[{"type":"paragraph"}]}',
      category: body.category || 'teacher',
      emoji: body.emoji || '📄',
      tags: body.tags || [],
      status: body.status || 'draft',
      isPinned: body.isPinned || false,
      isFavorite: body.isFavorite || false,
      wordCount: body.wordCount || 0,
      authorName: body.authorName || 'John Doe',
      authorAvatar: body.authorAvatar || 'https://i.pravatar.cc/150?u=1',
      version: body.version || 1
    });

    return NextResponse.json({ success: true, data: newDocument }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
