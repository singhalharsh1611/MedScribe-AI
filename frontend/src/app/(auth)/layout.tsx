import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader />
      <main className="flex-1 flex flex-col pt-16">
        {children}
      </main>
      <AuthFooter />
    </div>
  );
}
