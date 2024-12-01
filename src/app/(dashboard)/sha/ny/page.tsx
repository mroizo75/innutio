import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { getCurrentUser } from "@/lib/auth-utils";
import SHAPlanForm from "@/components/SHAPlanForm";

export default async function NySHAPlanPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ny SHA-plan</h1>
        </div>
        <SHAPlanForm />
      </main>
    </div>
  );
}