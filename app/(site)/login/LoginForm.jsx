"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SignIn = dynamic(
  () => import("@stackframe/stack").then((m) => m.SignIn),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4" data-testid="login-skeleton">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
      </div>
    ),
  }
);

export default function LoginForm({ redirectUrl }) {
  return <SignIn fullPage={false} redirectUrl={redirectUrl} />;
}
