import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EnvFileViewDialogProps {
  envFile: string;
}

export function EnvFileViewDialog({ envFile }: EnvFileViewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View .env File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>.env File Contents</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm whitespace-pre-wrap break-all">
            {envFile}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}