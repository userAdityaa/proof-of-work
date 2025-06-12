import usePhantom from "../hooks/usePhantom";
import Image from "next/image";

export default function Navbar() {
  const { connectWallet, disconnectWallet, publicKey } = usePhantom();

  const shortenAddress = (address: string) =>
    address.slice(0, 4) + "..." + address.slice(-4);

  const handleClick = () => {
    if (publicKey) {
      disconnectWallet(); 
    } else {
      connectWallet(); 
    }
  };

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
        <button
          onClick={handleClick}
          className="bg-[#FFC949] border-3 border-[#420E40] text-black font-medium px-4 py-2 rounded-xl hover:bg-[#FFE07A] transition"
        >
          {publicKey ? shortenAddress(publicKey) + " (Logout)" : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
