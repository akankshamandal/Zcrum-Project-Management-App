"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug: string) {
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

  const client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  const memberships =
    await client.organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = memberships.data.find(
  (member) => member.publicUserData?.userId === userId
);

  if (!userMembership) {
    return null;
  }

  return organization;
}

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

  return await db.project.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserIssues(userId: string) {
  const { orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await db.issue.findMany({
    where: {
      OR: [
        {
          assigneeId: user.id,
        },
        {
          reporterId: user.id,
        },
      ],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getOrganizationUsers(orgId: string) {
  const users = await db.user.findMany();

  console.log("ALL USERS:", users);

  return users;
}