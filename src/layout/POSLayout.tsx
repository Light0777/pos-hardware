import { type ReactNode } from "react";

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {children}
    </div>
  );
}