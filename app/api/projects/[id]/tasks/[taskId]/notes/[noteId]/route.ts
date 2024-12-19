import { NextResponse } from 'next/server';
import { db } from '@/db';
import { taskNotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string; taskId: string; noteId: string } }
  ) {
    const noteId = parseInt(params.noteId);
  
    try {
      const deletedNote = await db
        .delete(taskNotes)
        .where(eq(taskNotes.id, noteId))
        .returning();
  
      if (deletedNote.length === 0) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
  }