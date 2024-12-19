import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { envFile } = await request.json();
  
  const updatedProject = await db
    .update(projects)
    .set({ envFile })
    .where(eq(projects.id, projectId))
    .returning();

  if (updatedProject.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Only return the envFile to minimize data transfer
  return NextResponse.json({ envFile: updatedProject[0].envFile });
}