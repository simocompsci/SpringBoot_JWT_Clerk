import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white">
        <h1 className="text-black">Welcome to your student portal</h1>
        <Show when="signed-out">
          <Link href={"sign-in"}>
            <button className="bg-black py-2 px-3">Sign in</button>
          </Link>{" "}
        </Show>

        {/* Signed In */}
        <Show when="signed-in">
          <UserButton />
        </Show>
      </main>
    </div>
  );
}
