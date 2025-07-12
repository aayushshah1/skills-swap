import { createServerClient } from "@supabase/ssr";
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;

    // Define whitelist of paths that can be accessed without authentication
    const publicPaths = ["/", "/login", "/unauthorized"];
    const isPublicPath = publicPaths.some(path => 
        pathname === path || (path !== "/" && pathname.startsWith(path))
    );

    if (!session?.access_token) {
        // If no session and not a public path, redirect to login
        if (!isPublicPath) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // Decode JWT to extract custom claims (e.g., role)
    const token = session.access_token;
    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
    );

    const role = payload.user_role || "user"; // fallback role

    // Role-based redirects
    if (pathname.startsWith("/admin") && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        url.searchParams.set("user_role", role);
        url.searchParams.set("path_tried", pathname.substring(1)); // Remove leading slash
        url.searchParams.set("correct_role", "admin");
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/user") && !["user", "admin"].includes(role)) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        url.searchParams.set("user_role", role);
        url.searchParams.set("path_tried", pathname.substring(1)); // Remove leading slash
        url.searchParams.set("correct_role", "user");
        return NextResponse.redirect(url);
    }
    
    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
