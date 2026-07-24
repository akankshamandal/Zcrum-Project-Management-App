"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
}

// ================= CREATE PROJECT =================
export async function createProject(data: CreateProjectData) {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  const client = await clerkClient();

  // Check if user is admin
  const { data: membershipList } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membershipList.find(
    (membership) => membership.publicUserData?.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error creating project: " + error.message);
    }

    throw new Error("Error creating project");
  }
}

// ================= GET SINGLE PROJECT =================
export async function getProject(projectId: string) {
  console.log("Project ID:", projectId);
  const { userId, orgId } = await auth();
  console.log("User:", userId);
  console.log("Org:", orgId);

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      sprints: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.organizationId !== orgId) {
    return null;
  }

  return project;
}

// ================= GET ALL PROJECTS =================
export async function getProjects(orgId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await db.project.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sprints: true,
    },
  });

  return projects;
}

// ================= DELETE PROJECT =================
export async function deleteProject(projectId: string) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }

  await db.project.delete({
    where: {
      id: projectId,
    },
  });

  return {
    success: true,
  };
}