"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  IssuePriority,
  IssueStatus, Sprint
} from "@prisma/client";

import useFetch from "@/hooks/use-fetch";

import statuses from "@/data/status.json";
import {
  getIssuesForSprint,
  updateIssueOrder,
} from "@/actions/issues";

import SprintManager from "./sprint-manager";
import IssueCreationDrawer from "./create-issue";
import IssueCard from "@/components/ui/issue-card";
import BoardFilters from "./board-filters";

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

type SprintType = Sprint;

interface SprintBoardProps {
  sprints: SprintType[];
  projectId: string;
  orgId: string;
}

function reorder<T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(list);

  const [removed] = result.splice(startIndex, 1);

  result.splice(endIndex, 0, removed);

  return result;
}

export default function SprintBoard({
  sprints,
  projectId,
  orgId,
}: SprintBoardProps) {
  const [currentSprint, setCurrentSprint] =
  useState<SprintType>(
    sprints.find((spr) => spr.status === "ACTIVE") ??
      sprints[0]
  );

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<IssueStatus | null>(null);

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch<IssueType[], [string]>(
    getIssuesForSprint
  );

  const [filteredIssues, setFilteredIssues] =
    useState<IssueType[]>([]);

  const handleFilterChange = (
    newFilteredIssues: IssueType[]
  ) => {
    setFilteredIssues(newFilteredIssues);
  };

useEffect(() => {
  if (currentSprint.id) {
    fetchIssues(currentSprint.id);
  }
}, [currentSprint.id, fetchIssues]);

  useEffect(() => {
    if (issues) {
        queueMicrotask(() => {
            setFilteredIssues(issues);
        });
    }
}, [issues]);

  const handleAddIssue = (
    status: IssueStatus
  ) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {
    if (currentSprint?.id) {
      void fetchIssues(currentSprint.id);
    }
  };

  const {
    fn: updateIssueOrderFn,
    loading: updateIssuesLoading,
    error: updateIssuesError,
  } = useFetch<
    { success: boolean },
    [
      {
        id: string;
        status: IssueStatus;
        order: number;
      }[]
    ]
  >(updateIssueOrder);

    const onDragEnd = async (
    result: DropResult
  ): Promise<void> => {
    if (currentSprint.status === "PLANNED") {
      toast.warning("Start the sprint to update board");
      return;
    }

    if (currentSprint.status === "COMPLETED") {
      toast.warning("Cannot update board after sprint end");
      return;
    }

    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!issues) return;

    const newOrderedData: IssueType[] = [...issues];

    const sourceList = newOrderedData.filter(
      (issue) =>
        issue.status ===
        (source.droppableId as IssueStatus)
    );

    const destinationList = newOrderedData.filter(
      (issue) =>
        issue.status ===
        (destination.droppableId as IssueStatus)
    );

    if (
      source.droppableId ===
      destination.droppableId
    ) {
      const reorderedCards = reorder(
        sourceList,
        source.index,
        destination.index
      );

      reorderedCards.forEach((card, index) => {
        card.order = index;
      });
    } else {
      const [movedCard] = sourceList.splice(
        source.index,
        1
      );

      if (!movedCard) return;

      movedCard.status =
        destination.droppableId as IssueStatus;

      destinationList.splice(
        destination.index,
        0,
        movedCard
      );

      sourceList.forEach((card, index) => {
        card.order = index;
      });

      destinationList.forEach((card, index) => {
        card.order = index;
      });
    }

    const updatedIssues = newOrderedData
      .map((issue) => {
        const sourceIssue = sourceList.find(
          (i) => i.id === issue.id
        );

        if (sourceIssue) return sourceIssue;

        const destinationIssue =
          destinationList.find(
            (i) => i.id === issue.id
          );

        return destinationIssue ?? issue;
      })
      .sort((a, b) => {
        if (a.status === b.status) {
          return a.order - b.order;
        }

        return a.status.localeCompare(
          b.status
        );
      });

    setIssues(updatedIssues);

    await updateIssueOrderFn(
      updatedIssues.map((issue) => ({
        id: issue.id,
        status: issue.status,
        order: issue.order,
      }))
    );
  };

  if (issuesError) {
    return (
      <div>Error loading issues.</div>
    );
  }
    return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={sprints}
        projectId={projectId}
      />

      {issues && !issuesLoading && (
        <BoardFilters
          issues={issues}
          onFilterChange={handleFilterChange}
        />
      )}

      {updateIssuesError && (
        <p className="text-red-500 mt-2">
          {updateIssuesError.message}
        </p>
      )}

      {(updateIssuesLoading || issuesLoading) && (
        <BarLoader
          className="mt-4"
          width={"100%"}
          color="#36d7b7"
        />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {statuses.map((column) => (
            <Droppable
              key={column.key}
              droppableId={column.key}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {column.name}
                  </h3>

                  {filteredIssues
                    ?.filter(
                      (issue) =>
                        issue.status === column.key
                    )
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                        isDragDisabled={
                          updateIssuesLoading
                        }
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <IssueCard
                              issue={issue}
                              onDelete={() => {
                                void fetchIssues(
                                  currentSprint.id
                                );
                              }}
                              onUpdate={(
                                updatedIssue
                              ) => {
                                setIssues(
                                  (prev) =>
                                    prev?.map(
                                      (issue) =>
                                        issue.id ===
                                        (
                                          updatedIssue as IssueType
                                        ).id
                                          ? (
                                              updatedIssue as IssueType
                                            )
                                          : issue
                                    ) ?? []
                                );
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                  {column.key === "TODO" &&
                    currentSprint.status !==
                      "COMPLETED" && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() =>
                          handleAddIssue(
                            column.key as IssueStatus
                          )
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedStatus && (
        <IssueCreationDrawer
          isOpen={isDrawerOpen}
          onClose={() =>
            setIsDrawerOpen(false)
          }
          sprintId={currentSprint.id}
          status={selectedStatus}
          projectId={projectId}
          onIssueCreated={
            handleIssueCreated
          }
          orgId={orgId}
        />
      )}
    </div>
  );
}