import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Fetches the currently authenticated Clerk user and syncs them
 * with the PostgreSQL database if they are not already registered.
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    // Check if user exists in database
    const [dbUser] = await db.select().from(users).where(eq(users.id, clerkUser.id));

    if (dbUser) return dbUser;

    // Auto-sync: Create user in database
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "طالب مسلك";
    const avatarUrl = clerkUser.imageUrl;

    if (!email) {
      throw new Error("Clerk user must have an email address");
    }

    const [newUser] = await db
      .insert(users)
      .values({
        id: clerkUser.id,
        name,
        email,
        avatarUrl,
        role: "student", // Default role
        xp: 0,
        gems: 100,
        streak: 0,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error("Error syncing Clerk user to database:", error);
    return null;
  }
}

/**
 * Assures user is logged in, otherwise redirects to sign-in page.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

/**
 * Assures user is an admin, otherwise redirects to dashboard.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Assures user is a reviewer or an admin, otherwise redirects to dashboard.
 */
export async function requireReviewerOrAdmin() {
  const user = await requireAuth();
  if (user.role !== "reviewer" && user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}
