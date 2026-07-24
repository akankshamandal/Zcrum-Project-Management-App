"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { deleteProject } from "@/actions/projects";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

interface DeleteProjectProps {
  projectId: string;
}

export default function DeleteProject({
  projectId,
}: DeleteProjectProps) {
  const { membership } = useOrganization();
  const router = useRouter();

  const {
    loading: isDeleting,
    error,
    fn: deleteProjectFn,
    data: deleted,
  } = useFetch(deleteProject);

  const isAdmin = membership?.role === "org:admin";

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    toast.loading("Deleting project...", {
      id: "delete-project",
    });

    await deleteProjectFn(projectId);
  };

  useEffect(() => {
    if (deleted) {
      toast.success("Project deleted successfully!", {
        id: "delete-project",
        description: "The project has been permanently removed.",
      });

      router.refresh();
    }
  }, [deleted, router]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to delete project", {
        id: "delete-project",
        description: error.message,
      });
    }
  }, [error]);

  if (!isAdmin) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className={isDeleting ? "animate-pulse" : ""}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}