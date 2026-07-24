"use client";

import { usePathname } from "next/navigation";
import {
  OrganizationSwitcher,
  useOrganization,
  useUser,
} from "@clerk/nextjs";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  if (!isLoaded || !isUserLoaded) {
    return null;
  }

  return (
    <div className="flex justify-end mt-1">
      <OrganizationSwitcher
        createOrganizationMode="modal"
        appearance={{
          elements: {
            organizationSwitcherTrigger:
              "border border-gray-300 rounded-md px-5 py-2",
            organizationSwitcherTriggerIcon: "text-white",
          },
        }}
      />
    </div>
  );
};

export default OrgSwitcher;