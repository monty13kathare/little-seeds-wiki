import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Project from '@/models/Project';
import Document from '@/models/Document';

const TEACHER_LAYOUT = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🏫 Classroom Layout & Setup Guidelines' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Welcome teachers! This document outlines the mandatory layout and environmental setup for all Little Seeds classrooms.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🍀 Nature-Inspired Setup' }] },
    { type: 'bulletList', content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Natural Lighting' }, { type: 'text', text: ' — Keep blinds open during the day. Use warm-toned lamps instead of harsh overhead fluorescent bulbs where possible.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Sensory Corners' }, { type: 'text', text: ' — Maintain a designated quiet sensory zone with soft cushions, picture books, and tactile nature blocks.' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Eco Station' }, { type: 'text', text: ' — Ensure the recycling and organic compost bins are labeled and at child-eye level to encourage eco-consciousness.' }] }] }
    ]},
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📝 Daily Attendance Protocols' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'All classroom teachers must take daily attendance using the tablets by 9:15 AM sharp. Any unexplained absences should be logged for the admin desk to follow up.' }] }
  ]
});

const ADMIN_PORTAL = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🔑 Admin Portal Setup & Security' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Welcome admin! This manual contains highly sensitive information regarding access controls and portal settings.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🛡️ Role-Based Access Control' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Administrators can assign four distinct access groups to users: Admin, Teacher, Student, and Guest. Ensure that developer integrations are strictly isolated.' }] }
  ]
});

const DEV_API = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🔌 Little Seeds Core API Specifications' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Developer documentation for integrating third-party systems and custom portals with the Little Seeds backend database.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🔐 Authentication' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'All API requests must include a Bearer token in the Authorization header:' }] },
    { type: 'codeBlock', attrs: { language: 'typescript' }, content: [{ type: 'text', text: 'Authorization: Bearer <your_jwt_token_here>' }] }
  ]
});

const STUDENT_GUIDE = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🎒 Student Assignment Submission Guide' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Hey students! Here is the easy, step-by-step way to turn in your weekly worksheets and outdoor activities.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📸 Capturing Your Outdoor Discoveries' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'When you find a new leaf or seed during your nature walks, take a picture using your tablet, upload it to the assignment board, and write a one-sentence description!' }] }
  ]
});

const EDITOR_SHOWCASE = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🎨 Advanced Editor Features Showcase' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to the Little Seeds advanced document designer! This page serves as a live demonstration of all high-fidelity editing modules integrated into the platform.' }] },
    { type: 'horizontalRule' },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✨ Typography & Colors' }] },
    { type: 'paragraph', content: [
      { type: 'text', text: 'Apply custom ' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Bold' },
      { type: 'text', text: ', ' },
      { type: 'text', marks: [{ type: 'italic' }], text: 'Italic' },
      { type: 'text', text: ', ' },
      { type: 'text', marks: [{ type: 'underline' }], text: 'Underlined' },
      { type: 'text', text: ', or ' },
      { type: 'text', marks: [{ type: 'strike' }], text: 'Strikethrough' },
      { type: 'text', text: ' text decorations. You can also mix in ' },
      { type: 'text', marks: [{ type: 'textStyle', attrs: { color: '#fb923c' } }, { type: 'bold' }], text: 'custom colors' },
      { type: 'text', text: ' or ' },
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: '#fef08a' } }], text: 'vibrant highlights' },
      { type: 'text', text: ' for standard operating procedures!' }
    ]}
  ]
});

const COACH_WORKOUT = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '💪 Coaches Workout Builder Guide' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Guide for certified trainers and coaches on how to create, test, and distribute workout regimens for athletes.' }] }
  ]
});

const PULSEFIT_DEV = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '⚡ WebSocket Real-time Sync Specification' }] }
  ]
});

const APEX_MERCHANT = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '📦 Product Catalog & SKUs' }] }
  ]
});

const APEX_DEV = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '🔌 Headless GraphQL API Schema' }] }
  ]
});

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Clean up old data to enforce Little Seeds only context
    await Project.deleteMany({});
    await Document.deleteMany({});

    // 2. Seed Little Seeds Project
    const littleSeedsProject = await Project.create({
      id: 'p1',
      name: 'Little Seeds',
      description: 'School portal management system for teachers, admin, students, and parents.',
      icon: '🌱',
      color: '#10b981',
      version: 'v1.4.2',
      category: 'Education Platform',
      sections: [
        { id: 'teacher', label: 'Teachers Manuals', icon: 'GraduationCap' },
        { id: 'admin', label: 'Admin Portal Setup', icon: 'ShieldAlert' },
        { id: 'student', label: 'Student & Parent Guides', icon: 'Backpack' },
        { id: 'developer', label: 'Core Developer Specs', icon: 'Code' }
      ]
    });

    // 3. Seed Documents for Little Seeds
    await Document.create([
      { id: 'd_teacher_1', parentId: null, projectId: 'p1', title: 'Classroom Layout & Setup Guidelines', content: TEACHER_LAYOUT, category: 'teacher', emoji: '🏫', tags: ['setup', 'classroom'], status: 'published', isPinned: true, isFavorite: false, wordCount: 145, authorName: 'Principal Seeds', authorAvatar: 'https://i.pravatar.cc/150?u=1', version: 1 },
      { id: 'd_teacher_2', parentId: null, projectId: 'p1', title: 'Advanced Editor Features Showcase', content: EDITOR_SHOWCASE, category: 'teacher', emoji: '🎨', tags: ['showcase', 'editor'], status: 'published', isPinned: true, isFavorite: true, wordCount: 380, authorName: 'Little Seeds Support', authorAvatar: 'https://i.pravatar.cc/150?u=1', version: 1 },
      { id: 'd_admin_1', parentId: null, projectId: 'p1', title: 'Admin Portal Setup Guide', content: ADMIN_PORTAL, category: 'admin', emoji: '🔑', tags: ['admin', 'portal'], status: 'published', isPinned: true, isFavorite: true, wordCount: 88, authorName: 'Support Team', authorAvatar: 'https://i.pravatar.cc/150?u=2', version: 1 },
      { id: 'd_dev_1', parentId: null, projectId: 'p1', title: 'Core API Specifications', content: DEV_API, category: 'developer', emoji: '🔌', tags: ['api', 'developer'], status: 'published', isPinned: false, isFavorite: false, wordCount: 52, authorName: 'Lead Dev', authorAvatar: 'https://i.pravatar.cc/150?u=3', version: 2 },
      { id: 'd_student_1', parentId: null, projectId: 'p1', title: 'Assignment Submission Guide', content: STUDENT_GUIDE, category: 'student', emoji: '🎒', tags: ['homework', 'student'], status: 'published', isPinned: false, isFavorite: true, wordCount: 78, authorName: 'Teacher Maple', authorAvatar: 'https://i.pravatar.cc/150?u=4', version: 1 }
    ]);

    return NextResponse.json({ success: true, message: 'Database reset and seeded successfully with Little Seeds project and manuals!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
