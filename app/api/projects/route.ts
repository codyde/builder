import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, tasks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cookies } from "next/headers";
import { lucia } from '@/app/auth/lucia';



export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
	const { user, session } = await lucia.validateSession(sessionId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log(user!.username) 
    try {
      const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id));
  
      const projectsWithTasks = await Promise.all(allProjects.map(async (project) => {
        const projectTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.projectId, project.id))
          .orderBy(asc(tasks.createdAt));
  
        return {
          ...project,
          tasks: projectTasks,
          earliestTask: projectTasks[0] || null
        };
      }));
  
      return NextResponse.json(projectsWithTasks);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
  }

export async function POST(request: Request) {
  const sessionId = await cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
	const { user, session } = await lucia.validateSession(sessionId);
  console.log(user!.username) 
  const { name, description } = await request.json();
  const newProject = await db.insert(projects).values({ name, description, userId: user!.id }).returning();
  return NextResponse.json(newProject[0]);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { name, description } = await request.json();
  const updatedProject = await db
    .update(projects)
    .set({ name, description })
    .where(eq(projects.id, projectId))
    .returning();
  return NextResponse.json(updatedProject[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  await db.delete(projects).where(eq(projects.id, projectId));
  return NextResponse.json({ message: 'Project deleted successfully' });
}