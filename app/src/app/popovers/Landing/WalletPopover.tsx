import { useEffect, useRef } from "react";
import Image from "next/image";

interface WalletPopoverProps {
  onClose: () => void;
  status: 'disconnected' | 'connected' | 'onchain';
}

export const WalletPopover = ({ onClose, status }: WalletPopoverProps) => {
  const popoverRef = useRef(null);

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
    <div className="fixed bottom-6 right-6 z-50 font-mono">
      <div
        ref={popoverRef}
        className="relative bg-[#FFF7DC] border-4 border-[#B85C38] rounded-lg w-[350px] p-6 shadow-xl"
        style={{
          boxShadow: "0 0 0 4px #FFF7DC, 0 0 0 8px #5B1B63",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#5B1B63] text-xl font-extrabold hover:scale-110 transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src="/popover_mon.png"
              alt="Wallet mascot"
              fill
              className="object-contain"
            />
          </div>

          {status === 'disconnected' && (
            <>
              <h3 className="text-2xl font-bold text-[#5B1B63] mb-2">
                Connect Wallet
              </h3>
              <p className="text-[#5B1B63] mb-4 text-center text-xl">
                to Start Adventure
              </p>
              <p className="text-xl text-[#5B1B63] mb-6 text-center">
                Join challenges and earn SOL by connecting your Phantom wallet.
              </p>
            </>
          )}

          {status === 'connected' && (
            <>
              <h3 className="text-2xl font-bold text-[#5B1B63] mb-2">
                Choose Your Avatar
              </h3>
              <p className="text-[#5B1B63] mb-4 text-center text-xl">
                to Begin Your Journey
              </p>
              <p className="text-xl text-[#5B1B63] mb-6 text-center">
                Select your character and name to start completing challenges.
              </p>
            </>
          )}

          {status === 'onchain' && (
            <>
              <h3 className="text-2xl font-bold text-[#5B1B63] mb-2">
                Ready for Adventure!
              </h3>
              <p className="text-[#5B1B63] mb-4 text-center text-xl">
                Scroll Manually Or Click Explore Challenges
              </p>
              <p className="text-xl text-[#5B1B63] mb-6 text-center">
                Discover daily challenges, listed quests, and leaderboard rankings below.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};