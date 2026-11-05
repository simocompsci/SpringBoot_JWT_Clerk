import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <Suspense fallback={<div>Loading sign-in...</div>}>
        <SignIn
          appearance={{
            theme: 'simple',
          }}
          fallbackRedirectUrl="/workspace"
        />
      </Suspense>
    </div>
  );
}
