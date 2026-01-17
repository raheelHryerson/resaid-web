import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Ensure user is signed in; Clerk handles redirect
  const { userId } = await auth();
  if (!userId) return;

  if (isDashboard(req)) {
    // If onboarding cookie is set, allow
    const flag = req.cookies.get("onboardingCompleted")?.value;
    if (flag === "true") return;

    // Check DB flag via API
    try {
      const origin = req.nextUrl.origin;
      const r = await fetch(`${origin}/api/user/onboarding`, {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      });
      if (r.ok) {
        const j = await r.json();
        if (j?.onboardingCompleted === true) return; // allow
      }
    } catch (_) { /* ignore */ }

    // Fallback: check resumes via API (forward cookies for auth)
    try {
      const origin = req.nextUrl.origin;
      const res = await fetch(`${origin}/api/resumes`, {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const resumes = Array.isArray(data?.resumes) ? data.resumes : [];
        if (resumes.length > 0) return; // allow
      }
    } catch (_) {
      // ignore and redirect to onboarding
    }

    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
