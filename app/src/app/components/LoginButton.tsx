"use client";
import { useSession, signIn, signOut } from "next-auth/react"; 
 
export function LoginButton() {
    const { data: session } = useSession();
 
    const handleLogin = () => { 
        signIn("google");  
    }; 
 
    return (
        <button
            className={`border border-transparent rounded px-4 py-2 transition-colors ${
                session
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
            onClick={handleLogin} 
        >
            Authenticate
        </button>
    );
}