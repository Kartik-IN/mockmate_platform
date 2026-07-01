"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000, // milliseconds
    });

    // Set cookie in the browser
    cookieStore.set("session", sessionCookie, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord)
            return {
                success: false,
                message: "User does not exist. Create an account.",
            };

        await setSessionCookie(idToken);

        return {
            success: true,
            message: "Signed in successfully.",
        };
    } catch (error: any) {
        console.error("Error signing in:", error);

        return {
            success: false,
            message: "Failed to log into account. Please try again.",
        };
    }
}

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection("users").doc(uid).get();
        if (userRecord.exists)
            return {
                success: false,
                message: "User already exists. Please sign in.",
            };
        await db.collection("users").doc(uid).set({
            name,
            email,
            // profileURL,
            // resumeURL,
        });

        return {
            success: true,
            message: "Account created successfully. Please sign in.",
        };
    } catch (e: any) {
        console.error("Error creating user:", e);

        // Handle Firebase specific errors
        if (e.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use",
            };
        }

        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/sign-in");
}

export async function getCurrentUser(): Promise<User | null> {
    noStore();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection("users").doc(decodedToken.uid).get();

        if (!userRecord.exists) return null;

        const userData = userRecord.data() as Omit<User, "id">;

        return {
            id: decodedToken.uid,
            name: userData.name,
            email: userData.email,
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

