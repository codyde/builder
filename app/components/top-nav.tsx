"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "./themeswitcher";
import { useProjects } from '@/app/providers';

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    gitRepoUrl: "",
  });
  const { handleCreateProject } = useProjects();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleCreateProject(newProject);
      setNewProject({ name: "", description: "", gitRepoUrl: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-2xl font-bold">
              Builder
            </Link>
          </div>
          <div className="flex items-center">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">Create Project</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold">Create New Project</h3>
                  <Input
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Project Description"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Git Repository URL"
                    value={newProject.gitRepoUrl}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        gitRepoUrl: e.target.value,
                      })
                    }
                  />
                  <Button type="submit">Create</Button>
                </form>
              </PopoverContent>
            </Popover>
            <div className="ml-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}