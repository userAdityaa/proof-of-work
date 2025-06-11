import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-transparent h-[10rem]">
      {/* Logo */}
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={250} height={250} />
      </div>

      {/* Menu Links + Button */}
      <div className="flex items-center space-x-6 mb-[2rem]">
        <a href="#explore" className="text-white underline">Explore</a>
        <a href="#leaderboard" className="text-white underline">Leaderboard</a>
        <button className="bg-[#FFC949] border-3 border-[#420E40] text-black font-medium px-4 py-2 rounded-xl hover:bg-[#FFE07A] transition">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
