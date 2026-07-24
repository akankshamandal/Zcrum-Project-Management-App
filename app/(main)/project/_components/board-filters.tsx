"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssuePriority, IssueStatus } from "@prisma/client";

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
  order: number;
  projectId: string;
  sprintId: string | null;
  createdAt: Date;
  assignee: UserType | null;
  reporter: UserType;
}
interface BoardFiltersProps {
  issues: IssueType[];
  onFilterChange: (issues: IssueType[]) => void;
}

const priorities: IssueType["priority"][] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function BoardFilters({
  issues,
  onFilterChange,
}: BoardFiltersProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedAssignees,
    setSelectedAssignees,
  ] = useState<string[]>([]);

  const [
    selectedPriority,
    setSelectedPriority,
  ] = useState<
    IssueType["priority"] | ""
  >("");

  const assignees = issues
    .map((issue) => issue.assignee)
    .filter(
      (
        assignee
      ): assignee is UserType =>
        assignee !== null
    )
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.id === item.id
        )
    );

  useEffect(() => {
    const filteredIssues = issues.filter(
      (issue) =>
        issue.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) &&
        (selectedAssignees.length ===
          0 ||
          selectedAssignees.includes(
            issue.assignee?.id ?? ""
          )) &&
        (selectedPriority === "" ||
          issue.priority ===
            selectedPriority)
    );

    onFilterChange(filteredIssues);
  }, [
    searchTerm,
    selectedAssignees,
    selectedPriority,
    issues,
    onFilterChange,
  ]);

  const toggleAssignee = (
    assigneeId: string
  ) => {
    setSelectedAssignees((prev) =>
      prev.includes(assigneeId)
        ? prev.filter(
            (id) => id !== assigneeId
          )
        : [...prev, assigneeId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAssignees([]);
    setSelectedPriority("");
  };

  const isFiltersApplied =
    searchTerm !== "" ||
    selectedAssignees.length > 0 ||
    selectedPriority !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col pr-2 sm:flex-row gap-4 sm:gap-6 mt-6">
        <Input
          className="w-full sm:w-72"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        <div className="shrink-0">
          <div className="flex gap-2 flex-wrap">
            {assignees.map(
              (assignee, i) => {
                const selected =
                  selectedAssignees.includes(
                    assignee.id
                  );

                return (
                  <div
                    key={assignee.id}
                    className={`rounded-full ring ${
                      selected
                        ? "ring-blue-600"
                        : "ring-black"
                    } ${
                      i > 0
                        ? "-ml-6"
                        : ""
                    }`}
                    style={{
                      zIndex: i,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      toggleAssignee(
                        assignee.id
                      )
                    }
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          assignee.imageUrl ??
                          undefined
                        }
                      />
                      <AvatarFallback>
                        {assignee.name?.[0] ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <Select
          value={selectedPriority}
          onValueChange={(value) =>
            setSelectedPriority(
              value as
                | IssueType["priority"]
                | ""
            )
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>

          <SelectContent>
            {priorities.map(
              (priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                >
                  {priority}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {isFiltersApplied && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}