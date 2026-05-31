import { getPrisma } from "@/lib/prisma";
import { revokeAllUserSessions } from "@/lib/sessions";

export class PurgeMemberUserError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PurgeMemberUserError";
    this.status = status;
  }
}

export async function purgeMemberUser(params: { userId: string; actorAdminId: string }) {
  const prisma = getPrisma();

  if (params.userId === params.actorAdminId) {
    throw new PurgeMemberUserError("You cannot permanently delete your own admin account.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
      role: true,
    },
  });

  if (!user) {
    throw new PurgeMemberUserError("User not found", 404);
  }

  if (user.role === "ADMIN") {
    throw new PurgeMemberUserError("Operations admin accounts cannot be permanently deleted.", 400);
  }

  await revokeAllUserSessions(user.id);

  await prisma.user.delete({
    where: { id: user.id },
  });

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
  };
}
