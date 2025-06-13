"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import { Poppins, Pontano_Sans } from "next/font/google";
import Image from "next/image";
import usePhantom from "./hooks/usePhantom";

interface PopoverProps {
  onClose: () => void,
  characterIndex: number, 
  setCharacterIndex: React.Dispatch<React.SetStateAction<number>>;
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const pontano = Pontano_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pontano",
});

// Character List
const characters = [
  {
    name: "George",
    avatar: "/one_avatar.png",
    health: 90,
    attack: "Attack",
    defense: 50,
  },
  {
    name: "Luna",
    avatar: "/two_avatar.png",
    health: 75,
    attack: "Magic",
    defense: 60,
  },
];

// Popover Component
const Popover = ({ onClose, characterIndex, setCharacterIndex }: PopoverProps) => {
  const character = characters[characterIndex];
  const popoverRef = useRef(null);

  const nextCharacter = () => {
    setCharacterIndex((prev) => (prev + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      //@ts-ignore
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
      <div
        ref={popoverRef}
        className="relative bg-[#FFF7DC] border-4 border-[#B85C38] rounded-lg w-[700px] p-6 shadow-xl text-center"
        style={{
          boxShadow: "0 0 0 4px #FFF7DC, 0 0 0 8px #5B1B63",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#5B1B63] text-3xl font-extrabold hover:scale-110 transition"
        >
          ✕
        </button>

        {/* Left Arrow */}
        <button
          onClick={prevCharacter}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
        >
          ◀
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextCharacter}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
        >
          ▶
        </button>

        {/* Avatar */}
        <div>
          <Image
            src={character.avatar}
            alt={character.name}
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>

        {/* Character Info */}
        <h3 className="text-4xl font-bold text-[#5B1B63] mb-1 -mt-[5rem]">
          {character.name}
        </h3>
        <div className="flex justify-center gap-4 text-[#5B1B63] mb-6 text-sm">
          <div className="flex items-center gap-1">
            ❤️ <span className="font-bold text-lg">{character.health}</span>
          </div>
          <div className="flex items-center gap-1">
            🗡️ <span className="font-bold text-lg">{character.attack}</span>
          </div>
          <div className="flex items-center gap-1">
            🛡️ <span className="font-bold text-lg">{character.defense}</span>
          </div>
        </div>

        {/* Choose Button */}
        <button
          onClick={onClose}
          className="bg-[#FFC949] border-4 border-[#5B1B63] text-black font-bold py-2 px-6 rounded hover:bg-[#FFD866] transition w-full"
        >
          CHOOSE
        </button>
      </div>
    </div>
  );
};

// Home Component
export default function Home() {
  const { connectWallet } = usePhantom();
  const [showPopover, setShowPopover] = useState(false);
  const [characterIndex, setCharacterIndex] = useState(0);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/landing_page.png"
        alt="Landing Page Background"
        fill
        className="object-cover"
        priority
      />

      {/* Content Overlay */}
      <div className="relative z-10">
        <Navbar />

        <div className="absolute top-[220%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h1
            className={`text-[62px] text-[#5B1B63] leading-[80px] font-extrabold ${poppins.className}`}
          >
            Complete Real-World Challenges, Earn SOL
          </h1>
          <p
            className={`mt-4 text-[#5B1B63] text-lg md:text-2xl ${pontano.className}`}
          >
            Post adventures, set completion periods, and reward participants with
            SOL.
          </p>
          <button
            onClick={() => setShowPopover(true)}
            className="mt-6 bg-[#FFC949] border-[3px] border-[#420E40] text-black font-medium px-6 py-3 rounded-xl hover:bg-[#FFD866] transition"
          >
            Start Now
          </button>
        </div>
      </div>

      {/* Popover */}
      {showPopover && (
        <Popover
          onClose={() => setShowPopover(false)}
          characterIndex={characterIndex}
          setCharacterIndex={setCharacterIndex}
        />
      )}
    </div>
  );
}
