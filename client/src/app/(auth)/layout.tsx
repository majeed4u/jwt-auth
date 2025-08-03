import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" flex-col flex items-center justify-center w-full max-w-7xl mx-auto h-screen">
      {children}
    </div>
  );
}
