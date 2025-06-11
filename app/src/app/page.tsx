"use client";
import React, { useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoginButton } from "@/app/components/LoginButton"; 
import GetButton from "@/app/components/GetButton"; 
import {getAccount, useOkto } from '@okto_web3/react-sdk'; 
import Navbar from "./components/Navbar";
import { Poppins, Pontano_Sans } from "next/font/google";
 
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

const pontano = Pontano_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-pontano',
});
 
 
// export default function Home() {
//     const { data: session } = useSession(); 
//     const oktoClient = useOkto(); 
 
//     //@ts-ignore
//     const idToken = useMemo(() => (session ? session.id_token : null), [session]);
 
//     async function handleAuthenticate(): Promise<any> {
//         if (!idToken) {
//             return { result: false, error: "No google login" };
//         }
//         const user = await oktoClient.loginUsingOAuth({ 
//             idToken: idToken, 
//             provider: 'google', 
//         }); 
//         console.log("Authentication Success", user); 
//         return JSON.stringify(user);
//     }
 
//     async function handleLogout() {
//         try {
//             signOut();
//             return { result: "logout success" };
//         } catch (error:any) {
//             return { result: "logout failed" };
//         }
//     }
 
//     useEffect(()=>{
//         if(idToken){
//             handleAuthenticate();
//         }
//     }, [idToken])
 
//     return (
//         <main className="flex min-h-screen flex-col items-center space-y-6 p-12 bg-violet-200">
//             <div className="text-black font-bold text-3xl mb-8">Template App</div>
 
//             <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
//                 <LoginButton />
//                 <GetButton title="Okto Log out" apiFn={handleLogout} />
//                 <GetButton title="getAccount" apiFn={getAccount} />
//             </div>
//         </main>
//     );
// }

export default function Home() {
  return (
    <div
      className="h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/landing_page.png')" }}
    >
      {/* Navbar at the top */}
      <Navbar />

      {/* Centered Hero Text + Subtext + Button */}
      <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className={`text-[62px] text-[#5B1B63] leading-[80px] font-extrabold ${poppins.className}`}>
          Complete Real-World Challenges, Earn SOL
        </h1>
        <p className={`mt-4 text-[#5B1B63] text-lg md:text-2xl ${pontano.className}`}>
          Post adventures, set completion periods, and reward participants with SOL.
        </p>
        <button className="mt-6 bg-[#FFC949] border-[3px] border-[#420E40] text-black font-medium px-6 py-3 rounded-xl hover:bg-[#FFE07A] transition">
          Start Now
        </button>
      </div>
    </div>
  );
}
