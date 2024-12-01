import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { LagerholdingClient } from "./LagerholdingClient";

export default async function LagerholdingPage() {
  const session = await auth();
  const currentUser = await getUserById(session?.user?.id as string);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <LagerholdingClient currentUser={currentUser} />
    </div>
  );
}