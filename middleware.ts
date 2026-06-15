import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/lesson(.*)",
  "/leaderboard(.*)",
  "/profile(.*)",
  "/shop(.*)",
  "/review(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    await auth.protect((has) => has({ role: "org:admin" }));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/uploadthing).*)",
  ],
};
