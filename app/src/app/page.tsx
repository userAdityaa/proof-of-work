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
import Head from 'next/head';
import styles from './Home.module.css';

const Home = () => {
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();
  const [showPopover, setShowPopover] = useState(false);
  const [showWalletPopover, setShowWalletPopover] = useState(false);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState("landing");
  const [isNavigating, setIsNavigating] = useState(false);
  const [criticalError, setCriticalError] = useState<Error | null>(null);
  const [isAnyPopoverOpen, setIsAnyPopoverOpen] = useState(false);
  const setUserExists = useWalletStore((state) => state.setUserExists);
  const userExists = useWalletStore((state) => state.userExists);

  if(criticalError) { 
    throw criticalError;
  }

  const program = useMemo(() => {
    return getProvider(publicKey, sendTransaction, signTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    async function checkUserExistsOnChain() {
      if (program === null || publicKey === null) return;
      try {
        const userProfile = await getUser(program, publicKey);
        if (userProfile?.exists) {
          setUserExists(true);
        }
      } catch (error: any) {
        console.error("User doesn't exist.", error)
      }
    }

    checkUserExistsOnChain();
  }, [program, publicKey, connected, setUserExists]);

  // Navigate to section with smooth transition
  const navigateToSection = (sectionId: string) => {
    if (isNavigating) return; // Prevent multiple simultaneous navigations
    
    setIsNavigating(true);
    setCurrentSection(sectionId);
    
    // Update URL hash
    window.location.hash = sectionId === "landing" ? "" : `#${sectionId}`;

    // Reset navigation state after animation
    setTimeout(() => {
      setIsNavigating(false);
    }, 800);
  };

  // Handle navigation based on current section and direction
  const handleDownNavigation = () => {
    if (!userExists) {
      setShowWalletPopover(true);
      return;
    }

    if (currentSection === "landing") {
      navigateToSection("challenges");
    } else if (currentSection === "challenges") {
      navigateToSection("leaderboard");
    }
  };

  const handleUpNavigation = () => {
    if (!userExists) {
      setShowWalletPopover(true);
      return;
    }

    if (currentSection === "leaderboard") {
      navigateToSection("challenges");
    } else if (currentSection === "challenges") {
      navigateToSection("landing");
    }
  };

  // Handle initial section based on user status
  useEffect(() => {
    if (!userExists) {
      setCurrentSection("landing");
    }
  }, [userExists]);

  const getWalletStatus = () => {
    if (!connected) return "disconnected";
    if (connected && !userExists) return "connected";
    return "onchain";
  };

  const handleButtonClick = () => {
    const status = getWalletStatus();
    if (status === "disconnected" || status === "connected" || !userExists) {
      if(status === "connected" && !userExists) setShowPopover(true);
      else setShowWalletPopover(true);
    } else {
      navigateToSection("challenges");
    }
  };

  const getButtonText = () => {
    const status = getWalletStatus();
    return {
      disconnected: "Start Now",
      connected: "Continue",
      onchain: "Explore Challenges",
    }[status];
  };

  const handleAvatarSelected = async () => {
    // Called after successful avatar selection
    if (program && publicKey) {
      try {
        const userProfile = await getUser(program, publicKey);
        if (userProfile?.exists) {
          setUserExists(true); 
        }
      } catch (error: any) {
        console.error("Error checking user after avatar selection:", error);
        setCriticalError(error);
      }
    }
  };

  // Determine which navigation arrows to show
  const showDownArrow = currentSection === "landing" || currentSection === "challenges";
  const showUpArrow = currentSection === "challenges" || currentSection === "leaderboard";

  // Get transform style based on current section
  const getTransformStyle = () => {
    switch (currentSection) {
      case "landing":
        return "translateY(0)";
      case "challenges":
        return "translateY(-100vh)";
      case "leaderboard":
        return "translateY(-200vh)";
      default:
        return "translateY(0)";
    }
  };

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/f_auto,q_auto/v1750609994/landing_page.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697593/txg57gqxt9eavo1dikso_ew2c4e.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697840/leaderboard_section-1_tzg0l6.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608444/my_images/leader_board_one.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608227/my_images/down_arrow_nav.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608583/my_images/popover_mon.webp"
        />
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
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608583/my_images/popover_mon.webp"
        />
      </Head>

      <div className="w-full h-screen overflow-hidden">
        {/* Container that holds all sections */}
        <div 
          className="w-full h-full transition-transform duration-800 ease-in-out"
          style={{
            transform: getTransformStyle(),
            height: '300vh', // Total height for 3 sections
          }}
        >
          {/* Landing Page Section */}
          <section className="relative h-screen w-full overflow-hidden">
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/f_auto,q_auto/v1750609994/landing_page.webp"
              alt="Landing Page Background"
              fill
              className="object-cover"
              priority
            />

            <div className="relative z-10">
              {/* Navbar */}
              <Navbar 
                onSectionChange={(section) => {
                  navigateToSection(section);
                }}
               />

              {/* Main Header Text and Button */}
              <div className="flex flex-col items-center h-screen text-center w-[50%] max-md:w-[90%] mx-auto max-[1030]:mt-[5rem] max-md:mt-[2rem] min-[1500]:mt-[4.5rem]">
                <h1 className={`text-[62px] text-[#5B1B63] leading-[80px] font-extrabold ${poppins.className} max-[1030]:text-[4.5rem] max-md:text-[3.2rem] max-md:font-bold max-md:leading-[3.5rem] max-[1030]:w-[50rem] max-md:w-[100%] min-[1500]:text-[5.5rem] min-[1500]:leading-[6rem]`}>
                  Complete Real-World Challenges, Earn SOL
                </h1>
                <p className={`mt-4 text-[#5B1B63] text-2xl ${pontano.className} max-[1030]:text-[2.4rem] max-md:text-[1.6rem] max-md:leading-[2rem] min-[1500]:text-4xl`}>
                  Post adventures, set completion periods, and reward participants with SOL.
                </p>
                <button
                  onClick={handleButtonClick}
                  className={`mt-6 textured-button border-3 border-[#420E40] text-black px-4 py-3 rounded-lg font-bold ${poppins.className} max-[1030]:text-2xl max-md:text-xl max-md:font-semibold min-[1500]:text-2xl text-[1.15rem]`}
                >
                  {getButtonText()}
                </button>
              </div>
            </div>
          </section>

          {/* Challenges Section */}
          <section className="relative h-screen w-full">
            <ChallengeSection setIsAnyPopoverOpen={setIsAnyPopoverOpen}/>
          </section>

          {/* Leaderboard Section */}
          <section className="relative h-screen w-full">
            <LeaderBoardSection />
          </section>
        </div>

        {/* Popover Components */}
        {showPopover && (
          <AvatarPopover
            onClose={() => setShowPopover(false)}
            characterIndex={characterIndex}
            setCharacterIndex={setCharacterIndex}
            onAvatarSelected={handleAvatarSelected}
          />
        )}

        {showWalletPopover && (
          <WalletPopover onClose={() => setShowWalletPopover(false)} status={getWalletStatus()} />
        )}

        {/* Fixed Wallet Button */}
        <button
          onClick={() => {
            const status = getWalletStatus();
            if (status === "disconnected" || status === "connected" || !userExists) {
              setShowWalletPopover(true);
            }
          }}
          className="fixed bottom-6 right-6 bg-[#FFC949] border-4 border-[#5B1B63] text-black font-bold py-3 px-6 rounded-full hover:bg-[#FFD866] transition z-40 flex items-center gap-2"
        >
          <Image
            src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608583/my_images/popover_mon.webp"
            alt="Wallet mascot"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
          <div className="max-md:hidden">
            {getWalletStatus() === "disconnected"
              ? "Connect"
              : getWalletStatus() === "connected"
              ? "Choose Avatar"
              : "Scroll"}
          </div>
        </button>

        {/* Navigation Arrows */}
        {showDownArrow && (
          <button
            onClick={handleDownNavigation}
            className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 cursor-arrow-button transition-opacity duration-300 ${
              isNavigating ? "pointer-events-none opacity-50" : "opacity-100"
            } ${isAnyPopoverOpen ? styles.downArrowFade : ""}`} // Apply down arrow animation
          >
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608227/my_images/down_arrow_nav.webp"
              alt="Navigate to Next Section"
              width={150}
              height={140}
              className="object-contain hover:scale-110 transition-transform duration-300 -mb-[1.5rem]"
              priority
            />
          </button>
        )}

        {showUpArrow && (
          <button
            onClick={handleUpNavigation}
            className={`fixed top-2 left-1/2 transform -translate-x-1/2 cursor-arrow-button transition-opacity duration-300 ${
              isNavigating ? "pointer-events-none opacity-50" : "opacity-100"
            } ${isAnyPopoverOpen ? styles.upArrowFade : ""}`} // Apply up arrow animation
          >
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608227/my_images/down_arrow_nav.webp"
              alt="Navigate to Previous Section"
              width={150}
              height={140}
              className="object-contain transform rotate-180 hover:scale-110 transition-transform duration-300 -mt-[1.5rem]"
              priority
            />
          </button>
        )}
      </div>
    </>
  );
};

export default Home;