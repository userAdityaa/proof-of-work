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
    if(userProfile.exists && connected) { 
      setUserExists(true);
    }
  } 

  return (
    <nav className="w-full px-6 py-4 max-md:px-0 flex items-center justify-between max-md:justify-start max-md:gap-20 h-[10rem] max-md:h-[8rem]">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={250}
          height={250}
          className="w-[250px] max-md:w-[165px] h-auto"
          priority
        />
      </div>

      {/* Menu Links + Button */}
      <div className="flex items-center space-x-6 mb-[2rem] max-md:mt-2">
        <a href="#explore" className="text-white underline max-md:hidden">
          Explore
        </a>
        <a href="#leaderboard" className="text-white underline max-md:hidden">
          Leaderboard
        </a>
        <div onClick={checkUserExistsOnChain} className="max-md:w-[10rem]">
          <WalletMultiButton/>
        </div>
      </div>
    </nav>
  );
}
