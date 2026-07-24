import { getOrganization } from "@/actions/organization";
import { OrganizationSwitcher } from "@clerk/nextjs";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";
import { auth } from "@clerk/nextjs/server";

export default async function Organization({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { userId } = await auth();

if (!userId) {
  return <div>Unauthorized</div>;
}
  const { orgId } = await params;
  const organization = await getOrganization(orgId);
  
  if(!organization){
    return <div>Organization not found</div>;
  }

  return (
  <div>
    <div className="mb-8 flex justify-between items-start gap-8">
  {/* Left Side */}
  <div className="flex-1">
        <h1 className="text-5xl font-bold gradient-title pb-6">
          {organization.name}&rsquo;s Project
        </h1>

        <div className="space-y-4 w-full">
  <div className="w-full">
    <ProjectList orgId={organization.id} />
  </div>

  <div className="mt-8"><UserIssues userId={userId}/></div>
</div>
      </div>
      <OrganizationSwitcher />
    </div>
  </div> 
);
};