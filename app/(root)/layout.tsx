import React, {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image"
import { getCurrentUser, signOut } from "@/lib/actions/auth.action";

const RootLayout = async ({children}: {children: ReactNode }) => {
    const user = await getCurrentUser();

    return (
        <div className="root-layout">
            <nav className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={38} height={32} />
                    <h2 className="text-primary-100">MockMate</h2>
                </Link>

                <div className="flex items-center gap-3">
                    {!user ? (
                        <>
                            <Link href="/sign-in" className="btn-secondary">
                                Sign In
                            </Link>
                            <Link href="/sign-up" className="btn-primary">
                                Create Account
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-primary-100 font-semibold">
                                    {user.name}
                                </span>
                                <span className="text-sm text-light-400">
                                    {user.email}
                                </span>
                            </div>

                            <form action={signOut}>
                                <button className="btn-secondary" type="submit">
                                    Logout
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </nav>
            {children}
        </div>
    )

}
export default RootLayout
