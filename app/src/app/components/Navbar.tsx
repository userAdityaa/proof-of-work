import Image from "next/image";
import Link from "next/link";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProvider, getUser } from "../blockchain";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { useWalletStore } from "../store/store";
import Head from "next/head";

interface NavbarProps {
  onSectionChange: (page: string) => void;
}

export default function Navbar({ onSectionChange }: NavbarProps) {
  const { connected } = useWallet();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => getProvider(publicKey, sendTransaction, signTransaction), [publicKey, sendTransaction, signTransaction]);
  const setUserExists = useWalletStore((state) => state.setUserExists);

  async function checkUserExistsOnChain() {
    if (program === null || publicKey === null) return;
    const userProfile = await getUser(program, publicKey);
    if (userProfile.exists && connected) {
      setUserExists(true);
    }
  }

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608551/my_images/logo.webp"
        />
      </Head>

      <nav className="w-full px-6 py-4 max-md:px-0 flex items-center justify-between max-md:justify-start max-md:gap-20 h-[10rem] max-md:h-[8rem]">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608551/my_images/logo.webp"
              alt="Logo"
              width={250}
              height={250}
              className="w-[250px] max-md:w-[165px] h-auto"
              priority
            />
          </Link>
        </div>

        {/* Menu Links + Button */}
        <div className="flex items-center space-x-6 mb-[2rem] max-md:mt-2">
          <Link href="/about" className="text-white underline max-md:hidden">
            About
          </Link>
          <a href="#leaderboard" className="text-white underline max-md:hidden" onClick={() => onSectionChange('leaderboard')}>
            Leaderboard
          </a>
          <div onClick={checkUserExistsOnChain} className="max-md:w-[10rem]">
            <WalletMultiButton />
          </div>
        </div>
      </nav>
    </>
  );
}