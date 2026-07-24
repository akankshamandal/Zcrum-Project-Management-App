"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarLoader } from "react-spinners";

import OrgSwitcher from "@/components/ui/org-switcher";
import useFetch from "@/hooks/use-fetch";
import { projectSchema } from "@/app/lib/validators";
import { createProject } from "@/actions/projects";

export default function CreateProjectPage() {
  const router = useRouter();

  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();

  const isAdmin = membership?.role === "org:admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
  });

  const {
    loading,
    error,
    data: project,
    fn: createProjectFn,
  } = useFetch(createProject);

  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    if (!isAdmin) {
      toast.error("Only organization admins can create projects");
      return;
    }

    toast.loading("Creating project...", {
      id: "create-project",
    });

    await createProjectFn(data);
  };

  useEffect(() => {
    if (project) {
      toast.success("Project created successfully!", {
        id: "create-project",
        description: `${project.name} has been created successfully.`,
      });

      router.push(`/project/${project.id}`);
    }
  }, [project, router]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to create project", {
        id: "create-project",
        description: error.message,
      });
    }
  }, [error]);

  if (!isOrgLoaded || !isUserLoaded) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center pt-20">
        <span className="text-2xl gradient-title">
          Oops! Only Admins can create projects.
        </span>

        <OrgSwitcher />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl px-4">
      <h1 className="text-6xl text-center font-bold mb-8 gradient-title">
        Create New Project
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div>
          <Input
            {...register("name")}
            placeholder="Project Name"
            className="bg-slate-950"
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Input
            {...register("key")}
            placeholder="Project Key (Ex: RCYT)"
            className="bg-slate-950"
          />

          {errors.key && (
            <p className="text-red-500 text-sm mt-1">
              {errors.key.message}
            </p>
          )}
        </div>

        <div>
          <Textarea
            {...register("description")}
            placeholder="Project Description"
            className="bg-slate-950 h-28"
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {loading && (
          <BarLoader
            width="100%"
            color="#36d7b7"
          />
        )}

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </div>
  );
}