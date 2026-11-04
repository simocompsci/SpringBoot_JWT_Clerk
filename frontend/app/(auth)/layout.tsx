
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white gap-8 px-4 py-12 sm:px-6">
      {children}
    </main>
  );
}