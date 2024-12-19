import { github } from "@/app/auth/lucia";
import { generateState } from "arctic";
import { cookies } from "next/headers";

export const GET = async () => {
    const state = generateState();
    const url = await github.createAuthorizationURL(state);
    const cookieStore = cookies();

    cookieStore.set("github_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax"
    });
    return Response.redirect(url);
};