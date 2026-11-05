import { UserButton } from "@clerk/nextjs";
import { WorkspaceNav } from "./_components/WorkspaceNav";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-6 flex items-center justify-between px-6 py-4 sm:mx-10 sm:px-10 lg:mx-20 xl:mx-60">
          <span className="font-matcha text-4xl text-black">
            Students Portal
          </span>
          <UserButton />
        </div>
      </header>

      <section className="mx-6 flex-1 border-x border-neutral-200 px-6 py-12 sm:mx-10 sm:px-10 sm:py-16 lg:mx-20 xl:mx-60">
        <WorkspaceNav />
        {children}
      </section>
    </main>
  );
}
