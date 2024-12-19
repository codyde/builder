'use client'

import { ThemeProvider } from "next-themes"
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  gitRepoUrl?: string;
  tasks: any[]; // Replace 'any' with your Task type
  earliestTask: any | null; // Replace 'any' with your Task type
}

interface Task {
  id: number;
  name: string;
  status: "pending" | "completed";
}


interface ProjectContextType {
  projects: Project[];
  handleCreateProject: (newProject: { name: string; description: string; gitRepoUrl: string }) => Promise<void>;
  handleDeleteProject: (projectId: number) => Promise<void>;
  handleUpdateTask: (projectId: number, taskId: number, updates: Partial<Task>) => Promise<void>;
  handleUpdateProject: (projectId: number, updates: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
        console.log('Fetched projects:', data);  // Add this line
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  async function handleCreateProject(newProject: { name: string; description: string; gitRepoUrl: string }) {
    const tempId = Date.now();
    const projectWithTempId = { 
      ...newProject, 
      id: tempId, 
      tasks: [], 
      earliestTask: null,
    };

    setProjects(prevProjects => [...prevProjects, projectWithTempId]);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const createdProject = await response.json();

      setProjects(prevProjects => prevProjects.map(project => 
        project.id === tempId ? { ...createdProject, tasks: [], earliestTask: null } : project
      ));
    } catch (error) {
      console.error('Error creating project:', error);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== tempId));
    }
  }

  async function handleDeleteProject(projectId: number) {
    // Optimistically remove the project from the state
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      // If there's an error, revert the optimistic update
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
      throw error; // Re-throw the error so it can be handled by the component
    }
  }

  async function handleUpdateTask(projectId: number, taskId: number, updates: Partial<Task> | null) {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: updates === null
                ? project.tasks.filter(task => task.id !== taskId)
                : project.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                  )
            }
          : project
      )
    );
  
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: updates === null ? 'DELETE' : 'PATCH',
        headers: updates !== null ? { 'Content-Type': 'application/json' } : undefined,
        body: updates !== null ? JSON.stringify(updates) : undefined,
      });
  
      if (!response.ok) {
        throw new Error(updates === null ? 'Failed to delete task' : 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating/deleting task:', error);
      // Revert the optimistic update
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(prevProjects =>
          prevProjects.map(project =>
            project.id === projectId ? data : project
          )
        );
      }
      throw error;
    }
  }

  async function handleUpdateProject(projectId: number, updates: Partial<Project>) {
    setProjects(prevProjects => prevProjects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    ));

  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ProjectContext.Provider value={{ projects, handleCreateProject, handleDeleteProject, handleUpdateTask, handleUpdateProject }}>
        {children}
      </ProjectContext.Provider>
    </ThemeProvider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}