import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Document from '@/models/Document';

// PUT update a document by custom ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updatedDocument = await Document.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    );

    if (!updatedDocument) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDocument });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a document and recursively clean up all nested sub-documents (recursive tree safety)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Delete the main document
    const deletedDocument = await Document.findOneAndDelete({ id });

    if (!deletedDocument) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Recursively delete all children (where parentId matches) to avoid loose nodes
    const deleteChildren = async (parentId: string) => {
      const children = await Document.find({ parentId });
      if (children.length > 0) {
        await Document.deleteMany({ parentId });
        for (const child of children) {
          await deleteChildren(child.id);
        }
      }
    };

    await deleteChildren(id);

    return NextResponse.json({ success: true, message: 'Document and all its nested sub-pages deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
