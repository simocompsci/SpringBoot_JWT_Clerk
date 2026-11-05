"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/workspace", label: "Overview" },
  { href: "/workspace/grades", label: "Grades" },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace"
      className="mb-8 inline-flex items-center gap-1 border border-neutral-200 bg-white p-1"
    >
      {links.map((link) => {
        const isActive =
          link.href === "/workspace"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={` px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-neutral-100 text-black"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
