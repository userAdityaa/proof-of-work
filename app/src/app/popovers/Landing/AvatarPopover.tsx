import { createUser, getProvider } from "@/app/blockchain";
import { characters } from "@/constants/Characters";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface PopoverProps {
  onClose: () => void;
  characterIndex: number;
  setCharacterIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const AvatarPopover = ({ onClose, characterIndex, setCharacterIndex }: PopoverProps) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const character = characters[characterIndex];
  const program = useMemo(() => getProvider(publicKey, sendTransaction, signTransaction), [publicKey, signTransaction, sendTransaction]);
  const popoverRef = useRef(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const nextCharacter = () => {
    setCharacterIndex((prev) => (prev + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  function handleChoose() {
    if (program === null || publicKey === null) return;
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    createUser(program, publicKey, username, character.avatar);
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
        >
          ✕
        </button>

        <button
          onClick={prevCharacter}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
        >
          ◀
        </button>

        <button
          onClick={nextCharacter}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-4xl text-[#5B1B63] hover:scale-110 transition"
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
          onClick={() => {
            if (!username.trim()) {
              setError("Please enter a username");
              return;
            }
            onClose();
            handleChoose();
          }}
          className="bg-[#FFC949] border-4 border-[#5B1B63] text-black font-bold py-2 px-6 rounded hover:bg-[#FFD866] transition w-full"
        >
          CHOOSE
        </button>
      </div>
    </div>
  );
};