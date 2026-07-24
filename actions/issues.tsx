"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { IssuePriority, IssueStatus } from "@prisma/client";

interface CreateIssueData {
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  sprintId?: string | null;
  assigneeId?: string | null;
}

interface UpdateIssueData {
  status: IssueStatus;
  priority: IssuePriority;
}

interface IssueOrderData {
  id: string;
  status: IssueStatus;
  order: number;
}

export async function getIssuesForSprint(sprintId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  return await db.issue.findMany({
    where: { sprintId },
    orderBy: [
      { status: "asc" },
      { order: "asc" },
    ],
    include: {
      assignee: true,
      reporter: true,
    },
  });
}

export async function createIssue(
  projectId: string,
  data: CreateIssueData
) {
  const { userId, orgId } = await auth();

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

  const lastIssue = await db.issue.findFirst({
    where: {
      projectId,
      status: data.status,
    },
    orderBy: {
      order: "desc",
    },
  });

  const newOrder =
    lastIssue?.order != null
      ? lastIssue.order + 1
      : 0;

  return await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId,
      sprintId: data.sprintId ?? null,
      reporterId: user.id,
      assigneeId: data.assigneeId ?? null,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });
}

export async function updateIssueOrder(
  updatedIssues: IssueOrderData[]
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  await db.$transaction(async (tx) => {
    for (const issue of updatedIssues) {
      await tx.issue.update({
        where: {
          id: issue.id,
        },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return {
    success: true,
  };
}

export async function deleteIssue(
  issueId: string
) {
  const { userId, orgId } = await auth();

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

  const issue = await db.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      project: true,
    },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.reporterId !== user.id) {
    throw new Error(
      "You don't have permission to delete this issue"
    );
  }

  await db.issue.delete({
    where: {
      id: issueId,
    },
  });

  return {
    success: true,
  };
}

export async function updateIssue(
  issueId: string,
  data: UpdateIssueData
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const issue = await db.issue.findUnique({
      where: {
        id: issueId,
      },
      include: {
        project: true,
      },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (
      issue.project.organizationId !== orgId
    ) {
      throw new Error("Unauthorized");
    }

    return await db.issue.update({
      where: {
        id: issueId,
      },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        "Error updating issue: " +
          error.message
      );
    }

    throw new Error(
      "Error updating issue"
    );
  }
}