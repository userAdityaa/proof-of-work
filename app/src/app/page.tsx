"use client";
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import { poppins, pontano } from "@/constants/Font";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUser, getProvider } from "@/app/blockchain";
import { useWalletStore } from "./store/store";
import { WalletPopover } from "./popovers/Landing/WalletPopover";
import { AvatarPopover } from "./popovers/Landing/AvatarPopover";
import ChallengeSection from "./sections/ChallengeSection";
import LeaderBoardSection from "./sections/LeaderBoardSection";

export default function Home() {
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();
  const [showPopover, setShowPopover] = useState(false);
  const [showWalletPopover, setShowWalletPopover] = useState(false);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState("landing");
  const [isSpinning, setIsSpinning] = useState(false);
  const setUserExists = useWalletStore((state) => state.setUserExists);
  const userExists = useWalletStore((state) => state.userExists);

  const program = useMemo(() => {
    return getProvider(publicKey, sendTransaction, signTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    async function checkUserExistsOnChain() {
      if (program === null || publicKey === null) return;
      try {
        const userProfile = await getUser(program, publicKey);
        console.log("User profile check: ", userProfile);
        if (userProfile?.exists) {
          setUserExists(true);
        }
      } catch (error) {
        console.error("Error checking user on chain:", error);
      }
    }

    checkUserExistsOnChain();
  }, [program, publicKey, connected, setUserExists]);

  useEffect(() => {
    // Disable manual scrolling by setting overflow: hidden on body
    document.body.style.overflow = "hidden";

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Prevent default scroll behavior
    const preventScroll = (e: any) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
        e.preventDefault();
      }
    });

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScroll);
    };
  }, []);

  useEffect(() => {
    // Determine initial section on page load/refresh
    const determineInitialSection = () => {
      const hash = window.location.hash;
      if (hash === "#challenges") {
        setCurrentSection("challenges");
        const challengesSection = document.getElementById("challenges");
        if (challengesSection) {
          window.scrollTo({ top: challengesSection.offsetTop, behavior: "instant" });
        }
      } else if (hash === "#leaderboard") {
        setCurrentSection("leaderboard");
        const leaderboardSection = document.getElementById("leaderboard");
        if (leaderboardSection) {
          window.scrollTo({ top: leaderboardSection.offsetTop, behavior: "instant" });
        }
      } else {
        setCurrentSection("landing");
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    determineInitialSection();
  }, []);

  const getWalletStatus = () => {
    if (!connected) return "disconnected";
    if (connected && !userExists) return "connected";
    return "onchain";
  };

  const getNavbarHeight = () => {
    const navbar = document.querySelector("nav") || document.querySelector("header");
    return navbar ? navbar.offsetHeight : 80;
  };

  const handleButtonClick = () => {
    const status = getWalletStatus();
    if (status === "disconnected") {
      setShowWalletPopover(true);
    } else if (status === "connected") {
      setShowPopover(true);
    } else {
      setIsSpinning(true);
      setTimeout(() => {
        const challengesSection = document.getElementById("challenges");
        if (challengesSection) {
          window.scrollTo({
            top: challengesSection.offsetTop - getNavbarHeight(),
            behavior: "smooth",
          });
          setCurrentSection("challenges");
          window.location.hash = "#challenges";
        } else {
          console.error("Challenges section not found");
        }
        setIsSpinning(false);
      }, 1000);
    }
  };

  const handleDownArrowClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const challengesSection = document.getElementById("challenges");
      const leaderboardSection = document.getElementById("leaderboard");

      if (currentSection === "landing" && challengesSection) {
        window.scrollTo({
          top: challengesSection.offsetTop,
          behavior: "smooth",
        });
        setCurrentSection("challenges");
        window.location.hash = "#challenges";
      } else if (currentSection === "challenges" && leaderboardSection) {
        window.scrollTo({
          top: leaderboardSection.offsetTop,
          behavior: "smooth",
        });
        setCurrentSection("leaderboard");
        window.location.hash = "#leaderboard";
      } else {
        console.error("Target section not found");
      }
      setIsSpinning(false);
    }, 1000);
  };

  const handleTopArrowClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const landingSection = document.getElementById("landing");
      const challengesSection = document.getElementById("challenges");

      if (currentSection === "leaderboard" && challengesSection) {
        window.scrollTo({
          top: challengesSection.offsetTop,
          behavior: "smooth",
        });
        setCurrentSection("challenges");
        window.location.hash = "#challenges";
      } else if (currentSection === "challenges" && landingSection) {
        window.scrollTo({
          top: landingSection.offsetTop,
          behavior: "smooth",
        });
        setCurrentSection("landing");
        window.location.hash = "";
      } else {
        console.error("Target section not found");
      }
      setIsSpinning(false);
    }, 1000);
  };

  const getButtonText = () => {
    const status = getWalletStatus();
    return {
      disconnected: "Start Now",
      connected: "Continue",
      onchain: "Explore Challenges",
    }[status];
  };

  return (
    <div className={`w-full overflow-x-hidden overflow-y-hidden ${isSpinning ? "slot-machine-spin" : ""}`}>
      <style jsx>{`
        .slot-machine-spin {
          animation: slotMachine 1s ease-in-out;
        }

        @keyframes slotMachine {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          10% {
            transform: translateY(-10px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(20px);
            opacity: 0.5;
          }
          90% {
            transform: translateY(-10px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Landing Page Section */}
      <section id="landing" className="relative h-screen w-full overflow-hidden">
        <Image
          src="/landing_page.png"
          alt="Landing Page Background"
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-10">
          <Navbar />

          <div className="flex flex-col items-center h-screen text-center w-[50%] max-md:w-[90%] mx-auto max-[1030]:mt-[5rem] max-md:mt-[2rem] min-[1500]:mt-[4.5rem]">
            <h1 className={`text-[62px] text-[#5B1B63] leading-[80px] font-extrabold ${poppins.className} max-[1030]:text-[4.5rem] max-md:text-[3.2rem] max-md:font-bold max-md:leading-[3.5rem] max-[1030]:w-[50rem] max-md:w-[100%] min-[1500]:text-[5.5rem] min-[1500]:leading-[6rem]`}>
              Complete Real-World Challenges, Earn SOL
            </h1>
            <p className={`mt-4 text-[#5B1B63] text-lg ${pontano.className} max-[1030]:text-[2.4rem] max-md:text-[1.6rem] max-md:leading-[2rem] min-[1500]:text-4xl`}>
              Post adventures, set completion periods, and reward participants with SOL.
            </p>
            <button
              onClick={handleButtonClick}
              className="mt-6 bg-[#FFC949] border-[3px] border-[#420E40] text-black px-6 py-3 rounded-xl hover:bg-[#FFD866] transition max-[1030]:text-2xl max-md:text-xl max-md:font-semibold font-bold min-[1500]:text-2xl"
            >
              {getButtonText()}
            </button>
          </div>
        </div>

        {/* Down Arrow Button - Hidden in Leaderboard */}
        {currentSection !== "leaderboard" && (
          <button
            onClick={handleDownArrowClick}
            className={`fixed -bottom-8 left-1/2 transform -translate-x-1/2 z-50 ${isSpinning ? "pointer-events-none" : ""}`}
          >
            <Image
              src="/down_arrow_nav.png"
              alt="Scroll to Next Section"
              width={180}
              height={180}
              className="object-contain"
            />
          </button>
        )}

        {showPopover && (
          <AvatarPopover
            onClose={() => setShowPopover(false)}
            characterIndex={characterIndex}
            setCharacterIndex={setCharacterIndex}
          />
        )}

        {showWalletPopover && currentSection === "landing" && (
          <WalletPopover onClose={() => setShowWalletPopover(false)} status={getWalletStatus()} />
        )}

        <button
          onClick={() => {
            const status = getWalletStatus();
            if (status === "disconnected" || status === "connected" || status === "onchain") {
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
          <div className="max-md:hidden">
            {getWalletStatus() === "disconnected"
              ? "Connect"
              : getWalletStatus() === "connected"
              ? "Choose Avatar"
              : "Scroll"}
          </div>
        </button>
      </section>

      <section id="challenges" className="relative">
        <ChallengeSection />
        {(currentSection === "challenges" || currentSection === "leaderboard") && (
          <button
            onClick={handleTopArrowClick}
            className={`fixed -top-8 left-1/2 transform -translate-x-1/2 z-50 ${isSpinning ? "pointer-events-none" : ""}`}
          >
            <Image
              src="/down_arrow_nav.png"
              alt="Scroll to Previous Section"
              width={180}
              height={180}
              className="object-contain transform rotate-180"
            />
          </button>
        )}
      </section>

      <section id="leaderboard" className="relative">
        <LeaderBoardSection />
      </section>
    </div>
  );
}