import { ReactNode } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex justify-center pt-20 pb-5">
      {children}
    </div>
  );
}