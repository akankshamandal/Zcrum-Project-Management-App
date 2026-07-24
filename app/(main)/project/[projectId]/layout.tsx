import { Suspense, type ReactNode } from "react";
import { BarLoader } from "react-spinners";

export default function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto">
      <Suspense
        fallback={<BarLoader width="100%" color="#36d7b7" />}
      >
        {children}
      </Suspense>
    </div>
  );
}