"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

import { sprintSchema } from "@/app/lib/validators";
import useFetch from "@/hooks/use-fetch";
import { createSprint } from "@/actions/sprints";

interface SprintCreationFormProps {
  projectTitle: string;
  projectKey: string;
  projectId: string;
  sprintKey: number;
}

export default function SprintCreationForm({
  projectTitle,
  projectKey,
  projectId,
  sprintKey,
}: SprintCreationFormProps) {
  const [showForm, setShowForm] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const router = useRouter();

  const {
    loading: createSprintLoading,
    error,
    fn: createSprintFn,
  } = useFetch(createSprint);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof sprintSchema>>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: `${projectKey}-${sprintKey}`,
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
    },
  });

  const onSubmit = async (data: z.infer<typeof sprintSchema>) => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select a sprint duration");
      return;
    }

    toast.loading("Creating sprint...", {
      id: "create-sprint",
    });

    const result = await createSprintFn(projectId, {
      ...data,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });

    if (result) {
      toast.success("Sprint created successfully 🎉", {
        id: "create-sprint",
      });

      setShowForm(false);
      router.refresh();
    } else {
      toast.error("Failed to create sprint", {
        id: "create-sprint",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold mb-8 gradient-title">
          {projectTitle}
        </h1>

        <Button
          className="mt-2"
          onClick={() => setShowForm(!showForm)}
          variant={!showForm ? "default" : "destructive"}
        >
          {!showForm ? "Create New Sprint" : "Cancel"}
        </Button>
      </div>

      {showForm && (
        <Card className="pt-4 mb-4">
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Sprint Name
                </label>

                <Input
                  id="name"
                  {...register("name")}
                  readOnly
                  className="bg-slate-950"
                />

                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Sprint Duration
                </label>

                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-slate-950"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, yyyy")} -{" "}
                          {format(dateRange.to, "LLL dd, yyyy")}
                        </>
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto bg-slate-900"
                    align="start"
                  >
                    <DayPicker
                      mode="range"
                      disabled={[{ before: new Date() }]}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range) {
                          setDateRange(range);
                        }
                      }}
                      classNames={{
                        chevron: "fill-blue-500",
                        range_start: "bg-blue-700",
                        range_end: "bg-blue-700",
                        range_middle: "bg-blue-400",
                        day_button: "border-none",
                        today: "border-2 border-blue-700",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                disabled={createSprintLoading}
              >
                {createSprintLoading
                  ? "Creating..."
                  : "Create Sprint"}
              </Button>
            </form>

            {error && (
              <p className="text-red-500 mt-2">
                {error.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}