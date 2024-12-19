"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  PlusCircle,
  Trash2,
  Edit,
  Cog,
  X,
} from "lucide-react";
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
import { ProjectForm } from "@/app/components/projects/ProjectForm";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EnvFileManager } from "@/app/components/EnvFileManager";

interface Task {
  id: number;
  name: string;
  description: string;
  status: "pending" | "completed";
  notes: TaskNote[];
}

interface TaskNote {
  id: number;
  content: string;
  timestamp: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  gitRepoUrl?: string;
  envFile?: string;
  tasks: Task[];
}

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState({
    name: "",
    description: "",
  });

  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState("");
  const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (project) {
      setTasks(project.tasks);
    }
  }, [project]);

  useEffect(() => {
    if (selectedTask) {
      setTaskNotes(selectedTask.notes || []);
    }
  }, [selectedTask]);

  const router = useRouter();

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function fetchProject() {
    setIsLoading(true);
    try {
      const projectResponse = await fetch(`/api/projects/${id}`);
      if (!projectResponse.ok) throw new Error("Failed to fetch project");
      const projectData = await projectResponse.json();

      const tasksResponse = await fetch(`/api/projects/${id}/tasks`);
      if (!tasksResponse.ok) throw new Error("Failed to fetch tasks");
      const tasksData = await tasksResponse.json();

      setProject({ ...projectData, tasks: tasksData });
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateProject(updatedData: Partial<Project>) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update project");
      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editedTask) return;

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === editedTask.id ? editedTask : task))
    );
    setIsEditing(false);

    try {
      const response = await fetch(
        `/api/projects/${project!.id}/tasks/${editedTask.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedTask),
        }
      );

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert the state change if the API call fails
      setTasks(project!.tasks);
      // Optionally, show an error message to the user
    }
  }

  async function handleAddNote() {
    if (!selectedTask || !newNote.trim()) return;

    const newTaskNote: TaskNote = {
      id: Date.now(), // Temporary ID
      content: newNote,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setTaskNotes((prevNotes) => [...prevNotes, newTaskNote]);
    setNewNote("");

    try {
      const response = await fetch(
        `/api/projects/${project!.id}/tasks/${selectedTask.id}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newNote }),
        }
      );

      if (!response.ok) throw new Error("Failed to add note");

      const savedNote = await response.json();

      // Update the temporary ID with the real one from the server
      setTaskNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === newTaskNote.id ? savedNote : note))
      );
    } catch (error) {
      console.error("Error adding note:", error);
      // Revert the state change if the API call fails
      setTaskNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== newTaskNote.id)
      );
      // Optionally, show an error message to the user
    }
  }

  async function handleSaveEnvFile(envContent: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}/env`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envFile: envContent }),
      });
      if (!response.ok) throw new Error("Failed to save .env file");
      const updatedEnvFile = await response.json();

      setProject((prevProject) => {
        if (!prevProject) return null;
        return {
          ...prevProject,
          envFile: updatedEnvFile.envFile,
        };
      });
    } catch (error) {
      console.error("Error saving .env file:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteProject() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      router.push("/"); // Redirect to dashboard after deletion
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleTaskStatus(taskId: number) {
    if (!project) return;
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const newStatus =
      taskToUpdate.status === "completed" ? "pending" : "completed";

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await fetch(
        `/api/projects/${project.id}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update task");
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert the state change if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: taskToUpdate.status } : task
        )
      );
      // Optionally, show an error message to the user
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    const newTask: Task = {
      id: Date.now(), // Temporary ID
      name: newTaskInput.name,
      description: newTaskInput.description,
      status: "pending",
      notes: [],
    };

    // Optimistically update UI
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskInput({ name: "", description: "" });

    try {
      const response = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const createdTask = await response.json();

      // Update the temporary ID with the real one from the server
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === newTask.id ? createdTask : task))
      );
    } catch (error) {
      console.error("Error creating task:", error);
      // Revert the state change if the API call fails
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== newTask.id)
      );
      // Optionally, show an error message to the user
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!project) return;

    // Optimistically update UI
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

    try {
      const response = await fetch(
        `/api/projects/${project.id}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete task");
    } catch (error) {
      console.error("Error deleting task:", error);
      // Revert the state change if the API call fails
      setTasks(project.tasks);
      // Optionally, show an error message to the user
    }
  }

  async function handleDeleteNote(noteId: number) {
    if (!selectedTask) return;

    // Optimistically update UI
    setTaskNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

    try {
      const response = await fetch(
        `/api/projects/${project!.id}/tasks/${selectedTask.id}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete note");
    } catch (error) {
      console.error("Error deleting note:", error);
      // Revert the state change if the API call fails
      setTaskNotes(selectedTask.notes || []);
      // Optionally, show an error message to the user
    }
  }

  function calculateProgress() {
    if (!project || !project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="container mx-auto p-4">
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="space-x-4 items-center flex">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Cog className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Edit Project</DialogTitle>
                <ProjectForm
                  project={project}
                  onSubmit={handleUpdateProject}
                  onCancel={() => setIsEditing(false)}
                />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All tasks associated with this
                    project will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">{project.description}</p>

        {project.gitRepoUrl && (
          <p className="mb-4">
            Git Repository:{" "}
            <a
              href={project.gitRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {project.gitRepoUrl}
            </a>
          </p>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Progress</h2>
          <Progress value={calculateProgress()} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            {calculateProgress()}% complete
          </p>
        </div>

        <div className="mb-6 space-x-2">
          <EnvFileManager
            projectId={project.id}
            initialEnvContent={project.envFile || null}
            onSave={handleSaveEnvFile}
          />
        </div>

        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="text-xl">
                <PlusCircle className="mr-2" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[500px]">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <h3 className="font-semibold">Create New Task</h3>
                <Input
                  placeholder="Task Name"
                  value={newTaskInput.name}
                  onChange={(e) =>
                    setNewTaskInput({ ...newTaskInput, name: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Task Description"
                  value={newTaskInput.description}
                  onChange={(e) =>
                    setNewTaskInput({
                      ...newTaskInput,
                      description: e.target.value,
                    })
                  }
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Dialog
                key={task.id}
                onOpenChange={(open) => {
                  if (open) setSelectedTask(task);
                  else {
                    setSelectedTask(null);
                    setIsEditing(false);
                    setEditedTask(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Card className="cursor-pointer relative pb-12">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span
                          className={
                            task.status === "completed" ? "line-through" : ""
                          }
                        >
                          {task.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {task.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            disabled={isLoading}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {task.status === "completed"
                          ? "Mark Pending"
                          : "Mark Complete"}
                      </Button>
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                      {task.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setEditedTask(task);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                  {isEditing && editedTask ? (
                    <form onSubmit={handleEditTask} className="space-y-4">
                      <Input
                        value={editedTask.name}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            name: e.target.value,
                          })
                        }
                        placeholder="Task Name"
                      />
                      <Textarea
                        value={editedTask.description}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            description: e.target.value,
                          })
                        }
                        placeholder="Task Description"
                      />
                      <Button type="submit" disabled={isLoading}>
                        Save Changes
                      </Button>
                    </form>
                  ) : (
                    <>
                      <ReactMarkdown>{task.description}</ReactMarkdown>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Notes:</h4>
                        {taskNotes.length > 0 ? (
                          taskNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-2 border-2 rounded mb-2 relative"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <p className="text-sm pr-6">{note.content}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(note.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No notes yet.</p>
                        )}
                      </div>
                      <div className="mt-4">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                        />
                        <Button
                          onClick={handleAddNote}
                          disabled={isLoading}
                          className="mt-2"
                        >
                          Add Note
                        </Button>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}
