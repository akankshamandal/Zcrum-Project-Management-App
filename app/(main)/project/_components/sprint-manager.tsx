  "use client";

  import { useEffect} from "react";
  import { Button } from "@/components/ui/button";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Badge } from "@/components/ui/badge";

  import { BarLoader } from "react-spinners";
  import { formatDistanceToNow, isAfter, isBefore, format } from "date-fns";

  import useFetch from "@/hooks/use-fetch";
  import { useRouter, useSearchParams } from "next/navigation";

  import { updateSprintStatus } from "@/actions/sprints";

  import { Sprint, SprintStatus } from "@prisma/client";

  interface SprintManagerProps {
    sprint: Sprint;
    setSprint: React.Dispatch<React.SetStateAction<Sprint>>;
    sprints: Sprint[];
    projectId: string;
  }

  export default function SprintManager({
    sprint,
    setSprint,
    sprints,
    projectId,
  }: SprintManagerProps){
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
      fn: updateStatus,
      loading,
      data: updatedStatus,
    } = useFetch(updateSprintStatus);

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    const canStart =
      isBefore(now, endDate) && isAfter(now, startDate) && sprint.status === "PLANNED";

    const canEnd = sprint.status === "ACTIVE";

    const handleStatusChange = async (
        newStatus: SprintStatus
    ) => {
        await updateStatus(sprint.id, newStatus);
    };

  useEffect(() => {
    if (updatedStatus?.success) {
      setSprint(updatedStatus.sprint);
    }
  }, [updatedStatus, setSprint]);

    const getStatusText = () => {
      if (sprint.status === "COMPLETED") {
        return `Sprint Ended`;
      }
      if (sprint.status === "ACTIVE" && isAfter(now, endDate)) {
        return `Overdue by ${formatDistanceToNow(endDate)}`;
      }
      if (sprint.status === "PLANNED" && isBefore(now, startDate)) {
        return `Starts in ${formatDistanceToNow(startDate)}`;
      }
      return null;
    };

    useEffect(() => {
      const sprintId = searchParams.get("sprint");
      if (sprintId && sprintId !== sprint.id) {
        const selectedSprint = sprints.find((s) => s.id === sprintId);
          if (selectedSprint) {
              setSprint(selectedSprint);
          }
      }
    }, [
      searchParams,
      sprints,
      sprint.id,
      setSprint,
  ]);

      const handleSprintChange = (value: string | null) => {
        if (!value) return;

        const selectedSprint = sprints.find(
          (s) => s.id === value
        );

        if (!selectedSprint) return;

        setSprint(selectedSprint);

        router.replace(`/project/${projectId}`);
      };

    return (
      <>
        <div className="flex justify-between items-center gap-4">
          <Select value={sprint.id} onValueChange={handleSprintChange}>
            <SelectTrigger className="bg-slate-950 self-start">
              <SelectValue placeholder="Select Sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name} ({format(sprint.startDate, "MMM d, yyyy")} to{" "}
                  {format(sprint.endDate, "MMM d, yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canStart && (
            <Button
              onClick={() => handleStatusChange("ACTIVE")}
              disabled={loading}
              className="bg-green-900 text-white"
            >
              Start Sprint
            </Button>
          )}
          {canEnd && (
            <Button
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={loading}
              variant="destructive"
            >
              End Sprint
            </Button>
          )}
        </div>
        {loading && <BarLoader width={"100%"} className="mt-2" color="#36d7b7" />}
        {getStatusText() && (
          <Badge variant="secondary" className="mt-3 ml-1 self-start">
            {getStatusText()}
          </Badge>
        )}
      </>
    );
  }