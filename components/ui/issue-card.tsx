"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

import IssueDetailsDialog from "@/components/ui/issue-details-dialog";
import UserAvatar from "@/components/ui/user-avatar";
import {
  IssuePriority,
  IssueStatus,
} from "@prisma/client";

interface UserType {
  id: string;
  clerkUserId: string;
  name: string | null;
  imageUrl: string | null;
}

interface IssueType {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  createdAt: string | Date;
  projectId: string;
  sprintId: string | null;
  assignee: UserType | null;
  reporter: UserType;
}

interface IssueCardProps {
  issue: IssueType;
  showStatus?: boolean;
  onDelete?: (...args: unknown[]) => void;
  onUpdate?: (...args: unknown[]) => void;
}

const priorityColor: Record<
  IssueType["priority"],
  string
> = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

export default function IssueCard({
  issue,
  showStatus = false,
  onDelete = () => {},
  onUpdate = () => {},
}: IssueCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const router = useRouter();

  const onDeleteHandler = (...params: unknown[]) => {
    router.refresh();
    onDelete(...params);
  };

  const onUpdateHandler = (...params: unknown[]) => {
    router.refresh();
    onUpdate(...params);
  };

  const created = formatDistanceToNow(
    new Date(issue.createdAt),
    {
      addSuffix: true,
    }
  );

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader
          className={`border-t-2 ${
            priorityColor[issue.priority]
          } rounded-lg`}
        >
          <CardTitle>{issue.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2 -mt-3">
          {showStatus && <Badge>{issue.status}</Badge>}

          <Badge
            variant="outline"
            className="-ml-1"
          >
            {issue.priority}
          </Badge>
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-3">
          <UserAvatar user={issue.assignee} />

          <div className="text-xs text-gray-400 w-full">
            Created {created}
          </div>
        </CardFooter>
      </Card>

      {isDialogOpen && (
        <IssueDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          issue={issue}
          onDelete={onDeleteHandler}
          onUpdate={onUpdateHandler}
          borderCol={priorityColor[issue.priority]}
        />
      )}
    </>
  );
}