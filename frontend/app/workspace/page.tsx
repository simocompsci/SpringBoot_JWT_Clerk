import { OverviewContent } from "./_components/OverviewContent";

export default function WorkspacePage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="font-matcha text-4xl leading-tight text-black sm:text-5xl">
          Overview
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-base">
          Your grades and averages by semester.
        </p>
      </div>

      <OverviewContent />
    </>
  );
}
