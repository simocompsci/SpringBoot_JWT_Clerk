import type { ExamType, GradeRow } from "@/lib/grades-data";

type GradesTableProps = {
  rows: GradeRow[];
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatExamType(examType: ExamType): string {
  return examType.charAt(0) + examType.slice(1).toLowerCase();
}

const headerCell =
  "px-5 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500";
const bodyCell = "px-5 py-4";
const numericCell = `${bodyCell} text-right tabular-nums`;

export function GradesTable({ rows }: GradesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-50">
            <tr className="border-b border-neutral-200">
              <th scope="col" className={headerCell}>
                Code
              </th>
              <th scope="col" className={headerCell}>
                Course Name
              </th>
              <th scope="col" className={headerCell}>
                Exam Type
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Score
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Credits
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Coefficient
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Semester
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-neutral-500"
                >
                  No grades have been recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.code}-${row.examType}-${index}`}
                  className="border-t border-neutral-200 transition-colors hover:bg-neutral-50"
                >
                  <td
                    className={`${bodyCell} whitespace-nowrap font-mono text-xs uppercase tracking-widest text-neutral-500`}
                  >
                    {row.code}
                  </td>
                  <td
                    className={`${bodyCell} font-medium whitespace-nowrap text-black`}
                  >
                    {row.name}
                  </td>
                  <td className={`${bodyCell} whitespace-nowrap`}>
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                      {formatExamType(row.examType)}
                    </span>
                  </td>
                  <td
                    className={`${numericCell} font-semibold text-black`}
                  >
                    {formatNumber(row.score)}
                  </td>
                  <td className={`${numericCell} text-neutral-700`}>
                    {row.credits}
                  </td>
                  <td className={`${numericCell} text-neutral-700`}>
                    {formatNumber(row.coefficient)}
                  </td>
                  <td className={`${numericCell} text-neutral-700`}>
                    {row.semester}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
