import Image from "next/image";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProvider, getUser } from "../blockchain";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { useWalletStore } from "../store/store";

export default function Navbar() {
  const { connected } = useWallet();
  const {publicKey, sendTransaction, signTransaction} = useWallet();
  const program = useMemo(() => getProvider(publicKey, sendTransaction, signTransaction), [publicKey, sendTransaction, signTransaction]);
  const setUserExists = useWalletStore((state) => state.setUserExists);

  async function checkUserExistsOnChain () { 
    if(program === null || publicKey === null) return;
    const userProfile = await getUser(program, publicKey);
    if(connected && userProfile) { 
      setUserExists(true);
    }
  } 

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-transparent h-[10rem]">
      {/* Logo */}
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={250} height={250} priority />
      </div>

      {/* Menu Links + Button */}
      <div className="flex items-center space-x-6 mb-[2rem]">
        <a href="#explore" className="text-white underline">
          Explore
        </a>
        <a href="#leaderboard" className="text-white underline">
          Leaderboard
        </a>
        <div onClick={checkUserExistsOnChain}>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
