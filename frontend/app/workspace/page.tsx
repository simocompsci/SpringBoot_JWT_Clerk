import { UserButton } from "@clerk/nextjs";

export default function WorkspacePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-10">
        <span className="font-matcha text-2xl text-black">
          Students Portal
        </span>
        <UserButton />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-matcha text-5xl leading-tight text-black sm:text-6xl">
          Welcome to your workspace
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          You are signed in. This is your student workspace — your dashboard
          content will appear here.
        </p>
      </section>
    </main>
  );
}
