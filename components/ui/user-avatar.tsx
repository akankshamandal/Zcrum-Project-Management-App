import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id?: string;
  name?: string | null;
  imageUrl?: string | null;
}

interface UserAvatarProps {
  user?: User | null;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  return (
    <div className="flex items-center space-x-2 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={user?.imageUrl ?? ""}
          alt={user?.name ?? "User"}
        />

        <AvatarFallback className="capitalize">
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      <span className="text-xs text-gray-500">
        {user?.name ?? "Unassigned"}
      </span>
    </div>
  );
}