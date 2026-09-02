import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Returns the session, or null. Use in route handlers to check role.
export async function requireRole(allowedRoles = []) {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, ok: false, status: 401 };
  if (allowedRoles.length && !allowedRoles.includes(session.user.role)) {
    return { session, ok: false, status: 403 };
  }
  return { session, ok: true, status: 200 };
}
