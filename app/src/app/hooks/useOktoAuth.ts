"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useOkto } from "@okto_web3/react-sdk";
import { useMemo } from "react";

export function useOktoAuth() {
  const { data: session, status } = useSession();
  const oktoClient = useOkto();

  const loginWithGoogle = () => {
    signIn("google");
  };

  //@ts-ignore
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);

  async function loginWithOkto(): Promise<any> {
    if (!idToken) {
      console.error("No ID token available in session. Please sign in first.");
      return;
    }

    const user = await oktoClient.loginUsingOAuth({
      idToken: idToken, 
      provider: 'google',
    });

    console.log("Authentication success: ", user);
    return JSON.stringify(user);
  };

  return {
    session,
    status,
    loginWithGoogle,
    loginWithOkto,
    isAuthenticated: !!session?.user,
    signOut,
  };
}