import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EnvFileDialogProps {
  project: {
    id: number;
    envFile?: string;
  };
  onSave: (envContent: string) => void;
}

export function EnvFileDialog({ project, onSave }: EnvFileDialogProps) {
  const [envContent, setEnvContent] = useState(project.envFile || '');

  const handleSave = () => {
    onSave(envContent);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage .env File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit .env File</DialogTitle>
        </DialogHeader>
        <Textarea
          value={envContent}
          onChange={(e) => setEnvContent(e.target.value)}
          rows={10}
          placeholder="Paste your .env file contents here"
        />
        <Button onClick={handleSave}>Save .env File</Button>
      </DialogContent>
    </Dialog>
  );
}