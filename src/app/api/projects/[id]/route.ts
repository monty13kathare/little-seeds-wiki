import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Project from '@/models/Project';
import Document from '@/models/Document';

// PUT update a project by custom ID
export async function PUT(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Check if sections are being updated, and find deleted sections to clean up documents
    if (body.sections) {
      const existingProject = await Project.findOne({ id });
      if (existingProject) {
        const oldSectionIds = (existingProject.sections || []).map((s: any) => s.id);
        const newSectionIds = body.sections.map((s: any) => s.id);
        const deletedSectionIds = oldSectionIds.filter((sid: string) => !newSectionIds.includes(sid));

        if (deletedSectionIds.length > 0) {
          // Delete all documents in this category
          await Document.deleteMany({ projectId: id, category: { $in: deletedSectionIds } });
        }
      }
    }

    const updatedProject = await Project.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a project by custom ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedProject = await Project.findOneAndDelete({ id });

    if (!deletedProject) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
