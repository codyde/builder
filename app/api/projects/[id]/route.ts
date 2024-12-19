import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  
  return NextResponse.json({ ...project[0], tasks: projectTasks });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const projectId = parseInt(params.id);
    
    // Parse the request body
    const body = await request.json();
    const { name, description, gitRepoUrl } = body;
  
    try {
      const updatedProject = await db
        .update(projects)
        .set({ 
          name, 
          description, 
          gitRepoUrl 
        })
        .where(eq(projects.id, projectId))
        .returning();
  
      if (updatedProject.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
  
      return NextResponse.json(updatedProject[0]);
    } catch (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
  }

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const projectId = parseInt(params.id);
    
    try {
      // First, delete all tasks associated with the project
      await db.delete(tasks).where(eq(tasks.projectId, projectId));
      
      // Then, delete the project
      const deletedProject = await db.delete(projects).where(eq(projects.id, projectId)).returning();
  
      if (deletedProject.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Project and associated tasks deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
  }