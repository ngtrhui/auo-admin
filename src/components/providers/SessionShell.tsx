import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SessionShellClient } from "./SessionShellClient";

type SessionShellProps = {
  children: React.ReactNode;
};

export async function SessionShell({ children }: SessionShellProps) {
  const session = await getServerSession(authOptions);
  return (
    <SessionShellClient session={session}>{children}</SessionShellClient>
  );
}
