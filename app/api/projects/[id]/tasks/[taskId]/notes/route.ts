import { NextResponse } from 'next/server';
import { db } from '@/db';
import { taskNotes } from '@/db/schema';
import { sql, eq, asc } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const taskId = parseInt(params.taskId);
  
  const body = await request.json();
  const { content } = body;

  try {
    const newNote = await db
      .insert(taskNotes)
      .values({
        taskId,
        content,
        timestamp: sql`CURRENT_TIMESTAMP`, // Use SQL function for current timestamp
      })
      .returning();

    return NextResponse.json(newNote[0]);
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const taskId = parseInt(params.taskId);

  try {
    const notes = await db
      .select()
      .from(taskNotes)
      .where(eq(taskNotes.taskId, taskId))
      .orderBy(asc(taskNotes.timestamp));

    // Convert timestamp to ISO string for consistent formatting
    const formattedNotes = notes.map(note => ({
      ...note,
      timestamp: new Date(note.timestamp).toISOString()
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

