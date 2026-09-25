import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    const { data } = await supabase.auth.getClaims();
    const isAuthenticated = Boolean(data?.claims?.sub);
    const pathname = request.nextUrl.pathname;

    const publicRoutes = ["/", "/login", "/cadastro"];

    const isPublicRoute = publicRoutes.some(
        (route) =>
            pathname === route || pathname.startsWith(`${route}/`),
    );

    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (
        isAuthenticated &&
        (pathname === "/login" || pathname === "/cadastro")
    ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
}
