import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Editor from "@monaco-editor/react";

interface EnvFileManagerProps {
  projectId: number;
  initialEnvContent: string | null;
  onSave: (content: string) => Promise<void>;
}

export function EnvFileManager({
  projectId,
  initialEnvContent,
  onSave,
}: EnvFileManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [envContent, setEnvContent] = useState(initialEnvContent || "");

  const handleSave = async () => {
    await onSave(envContent);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {initialEnvContent ? "Manage .env File" : "Add .env File"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] sm:h-[600px]">
        <DialogHeader>
          <DialogTitle>Manage .env File</DialogTitle>
          <DialogDescription>
            Edit your projects environment variables here. These will be securely stored and used in your project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 h-[calc(100%-4rem)]">
          <Editor
            height="100%"
            defaultLanguage="plaintext"
            value={envContent}
            onChange={(value) => setEnvContent(value || "")}
            options={{
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wrappingStrategy: "advanced",
              wordWrap: "on",
            }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
