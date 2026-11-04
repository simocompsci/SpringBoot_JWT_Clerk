import { SignIn } from "@clerk/nextjs";


export default function SignInPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <SignIn />
    </div>
  );
}