import { Lucia } from "lucia";
import { GitHub } from "arctic";
import { sessionTable, users } from "@/db/schema";
import { cookies } from "next/headers";
import { cache } from "react";
import type { DatabaseUser } from "@/db/schema";
import type { Session, User } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/db";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, users);

export const lucia = new Lucia(adapter,
    {
        sessionCookie: {
            attributes: {
                secure: process.env.NODE_ENV === "production"
            }
        },
        
        getUserAttributes: (attributes) => {
            console.log("getting user attributes", attributes)
            return {
                id: attributes.githubId,
                githubId: attributes.githubId,
                username: attributes.username
            };
        }
    }
);

export const validateRequest =
    async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
        console.log("validating")
        const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return {
                user: null,
                session: null
            };
        }

        const result = await lucia.validateSession(sessionId);
        // next.js throws when you attempt to set cookie when rendering page
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
            if (!result.session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
        } catch { }
        return result;
    }

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Omit<DatabaseUser, "id">;
    }
}



export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);
