import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, taskNotes, projects } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const projectId = parseInt(params.id);
  
    try {
      const projectTasks = await db
        .select({
          id: tasks.id,
          name: tasks.name,
          description: tasks.description,
          status: tasks.status,
          notes: sql`COALESCE(json_agg(json_build_object('id', ${taskNotes.id}, 'content', ${taskNotes.content}, 'timestamp', ${taskNotes.timestamp})) FILTER (WHERE ${taskNotes.id} IS NOT NULL), '[]'::json)`
        })
        .from(tasks)
        .leftJoin(taskNotes, eq(tasks.id, taskNotes.taskId))
        .where(eq(tasks.projectId, projectId))
        .groupBy(tasks.id);
  
      return NextResponse.json(projectTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
  }

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { name, description, status } = await request.json();
  
  const newTask = await db.insert(tasks).values({
    projectId,
    name,
    description,
    status,
  }).returning();

  return NextResponse.json(newTask[0]);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const projectId = parseInt(params.id);
  const taskId = parseInt(params.taskId);
  const updates = await request.json();

  try {
    const updatedTask = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId) && eq(tasks.projectId, projectId))
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const projectId = parseInt(params.id);
    const { name, description, gitRepoUrl } = await request.json();
    const updatedProject = await db
      .update(projects)
      .set({ name, description, gitRepoUrl })
      .where(eq(projects.id, projectId))
      .returning();
    return NextResponse.json(updatedProject[0]);
  }
  