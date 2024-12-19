import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
    request: Request,
    { params }: { params: { id: string; taskId: string } }
  ) {
    const projectId = parseInt(params.id);
    const taskId = parseInt(params.taskId);
    
    const body = await request.json();
    const { name, description, status } = body;
  
    try {
      const updatedTask = await db
        .update(tasks)
        .set({ name, description, status })
        .where(eq(tasks.id, taskId))
        .returning();
  
      if (updatedTask.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
  
      return NextResponse.json(updatedTask[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
  }
  
  export async function DELETE(
    request: Request,
    { params }: { params: { id: string; taskId: string } }
  ) {
    const taskId = parseInt(params.taskId);
  
    try {
      const deletedTask = await db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
        .returning();
  
      if (deletedTask.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
  }