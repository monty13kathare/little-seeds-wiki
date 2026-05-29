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

    // 2. Seed Little Seeds Project (Empty state for Modules)
    const littleSeedsProject = await Project.create({
      id: 'p1',
      name: 'Little Seeds',
      description: 'School portal management system for teachers, admin, students, and parents.',
      icon: '🌱',
      color: '#10b981',
      version: 'v1.4.2',
      category: 'Education Platform',
      sections: [] // Empty by default so admin can create their own modules
    });

    return NextResponse.json({ success: true, message: 'Database reset and seeded successfully with Little Seeds project. Modules are empty for admin to configure.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

