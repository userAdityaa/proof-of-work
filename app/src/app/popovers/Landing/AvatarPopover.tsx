"use client";
import { createUser, getProvider } from "@/app/blockchain";
import { characters } from "@/constants/Characters";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Head from 'next/head';

<Head>
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608235/my_images/first_avatar.webp"
  />
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608611/my_images/second_avatar.webp"
  />
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608631/my_images/third_avatar.webp"
  />
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608241/my_images/fourth_avatar.webp"
  />
</Head>

interface PopoverProps {
  onClose: () => void;
  characterIndex: number;
  setCharacterIndex: React.Dispatch<React.SetStateAction<number>>;
  onAvatarSelected: () => void; // New prop to notify parent
}

export const AvatarPopover = ({ onClose, characterIndex, setCharacterIndex, onAvatarSelected }: PopoverProps) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const character = characters[characterIndex];
  const program = useMemo(() => getProvider(publicKey, sendTransaction, signTransaction), [publicKey, signTransaction, sendTransaction]);
  const popoverRef = useRef(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loader

  const nextCharacter = () => {
    setCharacterIndex((prev) => (prev + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  async function handleChoose() {
    if (program === null || publicKey === null) {
      setError("Wallet not connected");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    setIsLoading(true); // Show loader
    try {
      await createUser(program, publicKey, username, character.avatar);
      onAvatarSelected(); // Notify parent of success
      onClose(); // Close popover
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      // @ts-expect-error: event.target may not be typed as an Element
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
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#5B1B63] text-3xl font-extrabold hover:scale-110 transition"
          disabled={isLoading}
        >
          ✕
        </button>

        <button
          onClick={prevCharacter}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
          disabled={isLoading}
        >
          ◀
        </button>

        <button
          onClick={nextCharacter}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
          disabled={isLoading}
        >
          ▶
        </button>

        <div className="flex items-center justify-center">
          <Image
            src={character.avatar}
            alt="Character avatar"
            width={300}
            height={300}
            className="mx-auto"
            priority
          />
        </div>

        <div className="mt-[1rem]">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="Character Name"
            className="w-[40%] text-center p-3 border-2 border-[#5B1B63] rounded-lg text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC949]"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-center gap-4 text-[#5B1B63] mb-6 text-sm mt-4">
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

        <button
          onClick={handleChoose}
          className="bg-[#FFC949] border-4 border-[#5B1B63] text-black font-bold py-2 px-6 rounded hover:bg-[#FFD866] transition w-full flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            "CHOOSE"
          )}
        </button>

        <style jsx>{`
          .loader {
            border: 6px solid #f3f3f3;
            border-top: 6px solid #5B1B63;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};