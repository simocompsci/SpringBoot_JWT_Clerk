import { formatAverage, type SemesterAverage } from "@/lib/workspace-data";

type SemesterAverageCardProps = {
  semester: SemesterAverage;
  className?: string;
};

export function SemesterAverageCard({
  semester,
  className = "",
}: SemesterAverageCardProps) {
  return (
    <article
      className={`flex h-full flex-col justify-between border border-neutral-200 bg-neutral-50 p-6 sm:p-8 ${className}`}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Semester
        </p>
        <h2 className="mt-2 font-matcha text-4xl leading-tight text-black sm:text-5xl">
          Semester {semester.semester}
        </h2>
      </div>

      <div className="mt-10">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          Average
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight text-black sm:text-6xl">
            {formatAverage(semester.average)}
          </span>
          <span className="text-lg text-neutral-400">/ 20</span>
        </p>
      </div>
    </article>
  );
}
