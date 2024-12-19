"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingSkeleton } from "@/app/components/LoadingSkeleton";

interface Task {
  id: number;
  name: string;
  status: "pending" | "completed";
}

interface Project {
  id: number;
  name: string;
  description: string;
  gitRepoUrl?: string;
  envFile?: string;
  tasks: Task[];
  earliestTask: Task | null;
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleProjectClick(projectId: number) {
    router.push(`/projects/${projectId}`);
  }

  function calculateProgress(project: Project) {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  async function handleDelete(projectId: number, event: React.MouseEvent) {
    event.stopPropagation(); // Prevent card click event
    setIsLoading(true);
    setError(null);
    try {
      // Implement your delete logic here
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {projects.length === 0 ? (
        <p>No projects found. Start by creating a new project!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 relative h-[250px]"
              onClick={() => handleProjectClick(project.id)}
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => e.stopPropagation()} // Prevent card click
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the project {project.name} and all of its associated tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => handleDelete(project.id, e)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-full">
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-muted-foreground mb-4 truncate">
                          {project.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{project.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="mb-4">
                    <Progress
                      value={calculateProgress(project)}
                      className="w-full"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {calculateProgress(project)}% complete
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h4 className="font-semibold mb-2">Earliest Task:</h4>
                  {project.earliestTask ? (
                    <Badge
                      variant="outline"
                      className="bg-primary text-primary-foreground"
                    >
                      {project.earliestTask.name}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-secondary text-secondary-foreground"
                    >
                      No tasks yet
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 