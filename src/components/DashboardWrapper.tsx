import ClientOnly from "@/components/ClientOnly";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <div className="flex min-h-screen w-full flex-col">
        {children}
      </div>
    </ClientOnly>
  );
}
