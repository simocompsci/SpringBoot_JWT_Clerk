import { formatAverage } from "@/lib/workspace";
import type { CourseAverage } from "@/lib/types";

type CourseAverageCardProps = {
  course: CourseAverage;
};

export function CourseAverageCard({ course }: CourseAverageCardProps) {
  return (
    <article className="flex h-full flex-col justify-between border border-neutral-200 bg-neutral-100 p-5 transition-colors hover:border-neutral-400">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          {course.code}
        </p>
        <h3 className="mt-2 text-base font-medium leading-snug text-black">
          {course.name}
        </h3>
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-black">
          {formatAverage(course.average)}
        </span>
        <span className="text-sm text-neutral-400">/ 20</span>
      </div>
    </article>
  );
}
