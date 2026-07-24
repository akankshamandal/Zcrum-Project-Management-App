import React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto mt-5 px-4">
      {children}
    </div>
  );
}