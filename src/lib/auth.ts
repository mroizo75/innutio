import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type CurrentUser = {
  id: string;
  email: string;
  role: string;
  bedriftId: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const currentUser: CurrentUser = {
    id: session.user.id,
    email: session.user.email || "",
    role: session.user.role,
    bedriftId: session.user.bedriftId || "",
  };

  return currentUser;
}