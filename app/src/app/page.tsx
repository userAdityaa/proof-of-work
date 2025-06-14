"use client";
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import { poppins, pontano } from "@/constants/Font";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUser } from "@/app/blockchain";
import { getProvider } from "@/app/blockchain";
import { useWalletStore } from "./store/store"
import { WalletPopover } from "./popovers/Landing/WalletPopover";
import { AvatarPopover } from './popovers/Landing/AvatarPopover';

export default function Home() {
  const { connected } = useWallet();
  const [showPopover, setShowPopover] = useState(false);
  const [showWalletPopover, setShowWalletPopover] = useState(false);
  const [characterIndex, setCharacterIndex] = useState(0);
  const setUserExists = useWalletStore((state) => state.setUserExists);
  const userExists = useWalletStore((state) => state.userExists); 
  const {publicKey, sendTransaction, signTransaction} = useWallet();
  const program = useMemo(() => getProvider(publicKey, sendTransaction, signTransaction), [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    async function checkUserExistsOnChain () { 
      if(program === null || publicKey === null) return;
      const userProfile = await getUser(program, publicKey);
      if(userProfile) { 
        setUserExists(true);
      }
    }

    checkUserExistsOnChain();
  }, [program, publicKey, connected]);

  const getWalletStatus = () => {
    if (!connected) return 'disconnected';
    if (connected && !userExists) return 'connected';
    return 'onchain';
  };

  const handleButtonClick = () => {
    const status = getWalletStatus();
    
    if (status === 'disconnected') {
      setShowWalletPopover(true);
    } else if (status === 'connected') {
      setShowPopover(true);
    } else {
      document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getButtonText = () => {
    const status = getWalletStatus();
    return {
      'disconnected': 'Start Now',
      'connected': 'Continue',
      'onchain': 'Explore Challenges'
    }[status];
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/landing_page.png"
        alt="Landing Page Background"
        fill
        className="object-cover"
        priority
      />

      <div className="relative z-10">
        <Navbar />

        <div className="absolute top-[220%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className={`text-[62px] text-[#5B1B63] leading-[80px] font-extrabold ${poppins.className}`}>
            Complete Real-World Challenges, Earn SOL
          </h1>
          <p className={`mt-4 text-[#5B1B63] text-lg md:text-2xl ${pontano.className}`}>
            Post adventures, set completion periods, and reward participants with SOL.
          </p>
          <button
            onClick={handleButtonClick}
            className="mt-6 bg-[#FFC949] border-[3px] border-[#420E40] text-black font-medium px-6 py-3 rounded-xl hover:bg-[#FFD866] transition"
          >
            {getButtonText()}
          </button>
        </div>
      </div>

      {showPopover && (
        <AvatarPopover
          onClose={() => setShowPopover(false)}
          characterIndex={characterIndex}
          setCharacterIndex={setCharacterIndex}
        />
      )}

      {showWalletPopover && (
        <WalletPopover 
          onClose={() => setShowWalletPopover(false)} 
          status={getWalletStatus()} 
        />
      )}

      <button
        onClick={() => {
          const status = getWalletStatus();
          if (status === 'disconnected' || status === 'connected' || status === "onchain") {
            setShowWalletPopover(true);
          } 
        }}
        className="fixed bottom-6 right-6 bg-[#FFC949] border-4 border-[#5B1B63] text-black font-bold py-3 px-6 rounded-full hover:bg-[#FFD866] transition z-40 flex items-center gap-2"
      >
        <Image
          src="/popover_mon.png"
          alt="Wallet mascot"
          width={24}
          height={24}
          className="object-contain"
        />
        {getWalletStatus() === 'disconnected' ? 'Connect' : 
         getWalletStatus() === 'connected' ? 'Choose Avatar' : 'Scroll'}
      </button>
    </div>
  );
}