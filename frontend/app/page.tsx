import { Show } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
      <div className="grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
        <section className="flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="font-matcha text-5xl leading-[1.05] tracking-tight text-black sm:text-6xl lg:text-7xl">
            <span className="block">Welcome to the Students Portal</span>
          </h1>

          <p className="mt-6 text-md leading-relaxed text-neutral-600 sm:text-xl font-sans">
            Please log in to your account to access your workspace.
          </p>

          <Suspense fallback={<div className="mt-8 h-11 w-28 bg-neutral-200" />}>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="mt-8 inline-flex w-full rounded-[3px] items-center justify-center bg-black px-8 py-3 text-lg font-medium font-sans text-white"
              >
                Log in
              </Link>
            </Show>
          </Suspense>
        </section>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <Image
            src="/image1.jpg"
            alt="Student accessing the students portal"
            width={626}
            height={626}
            preload
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </main>
  );
}
