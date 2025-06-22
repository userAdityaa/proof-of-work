import Image from "next/image";
import { useState, useEffect } from "react";
import { luckiest_guy } from "@/constants/Font";
import Lottie from "lottie-react";
import loaderAnimation from "../../../public/loader.json";
import Head from "next/head";

const avatar_frame: Record<string, string> = {
  "first_avatar.webp": "https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608239/my_images/first_avatar_frame.webp",
  "second_avatar.webp": "https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608617/my_images/second_avatar_frame.webp",
  "third_avatar.webp": "https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750673762/third_avatar_frame.webp",
  "fourth_avatar.webp": "https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608244/my_images/fourth_avatar_frame.webp",
};

interface User {
  id: number;
  participant_score: number;
  creator_score: number;
  name?: string;
  avatar_url?: string;
}

export default function LeaderBoardSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<"participant_score" | "creator_score">("participant_score");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    throw error;
  }

  // Fetch users from the API
  const fetchUsers = async (sortType: "participant_score" | "creator_score") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users?sortBy=${sortType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();
      if (!Array.isArray(data.users)) {
        throw new Error("Invalid response format: users array expected");
      }

      setUsers(data.users);
    } catch (err: any) {
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when sortBy changes
  useEffect(() => {
    fetchUsers(sortBy);
  }, [sortBy]);

  // Split users into top 3 and the rest
  const topThreeUsers = users.slice(0, 3);
  const firstPlace = topThreeUsers[0];
  const secondPlace = topThreeUsers[1];
  const thirdPlace = topThreeUsers[2];
  const remainingUsers = users.slice(3);

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697840/leaderboard_section-1_tzg0l6.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608555/my_images/participants_button.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608220/my_images/creator_button.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750673762/third_avatar_frame.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608617/my_images/second_avatar_frame.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/my_images/first_avatar_frame.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608244/my_images/fourth_avatar_frame.webp"
        />
      </Head>
      <div className="relative h-screen w-full overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697840/leaderboard_section-1_tzg0l6.webp"
          alt="Landing Page Background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute left-1/2 top-[-6rem] -translate-x-1/2 flex gap-40">
          <button
            className={`transition-transform duration-100 active:scale-95 hover:brightness-110 ${
              sortBy === "creator_score" ? "opacity-100" : "opacity-70"
            }`}
            onClick={() => setSortBy("creator_score")}
            aria-label="View Creator Leaderboard"
          >
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608220/my_images/creator_button.webp"
              alt="Creator Button"
              width={380}
              height={380}
              className="object-contain"
              priority
            />
          </button>
          <button
            className={`transition-transform duration-100 active:scale-95 hover:brightness-110 ${
              sortBy === "participant_score" ? "opacity-100" : "opacity-70"
            }`}
            onClick={() => setSortBy("participant_score")}
            aria-label="View Participant Leaderboard"
          >
            <Image
              src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608555/my_images/participants_button.webp"
              alt="Participants Button"
              width={380}
              height={380}
              className="object-contain"
              priority
            />
          </button>
        </div>

        {/* Leaderboard Container */}
        <div className="absolute top-[22rem] right-[14%] w-[950px] h-[1000px]">
          <Image
            src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608444/my_images/leader_board_one.webp"
            alt="Leaderboard"
            width={950}
            height={1000}
            className="absolute inset-0"
            priority
          />

          {/* Top Three Users Positioned Relative to Leaderboard */}
          {!loading && !error && topThreeUsers.length > 0 && (
            <div className="absolute -top-[16rem] w-full flex justify-center items-end">
              {/* Second Place */}
              {secondPlace && (
                <div className="absolute left-[5%] flex flex-col items-center text-[#5B1B63] z-10 top-[4rem]">
                  <span className="mt-2 font-bold text-xl">{secondPlace.name}</span>
                  <span>{sortBy === "creator_score" ? secondPlace.creator_score : secondPlace.participant_score}</span>
                  <Image
                    src={secondPlace.avatar_url || "/default_avatar.png"}
                    alt={`${secondPlace.name || `User ${secondPlace.id}`} Avatar`}
                    width={180}
                    height={180}
                    className="rounded-full object-cover"
                  />
                </div>
              )}

              {/* First Place */}
              {firstPlace && (
                <div className="flex flex-col items-center text-[#5B1B63] z-20 mr-[5rem]">
                  <span className="mt-2 font-bold text-xl">{firstPlace.name}</span>
                  <span>{sortBy === "creator_score" ? firstPlace.creator_score : firstPlace.participant_score}</span>
                  <Image
                    src={firstPlace.avatar_url || "/default_avatar.png"}
                    alt={`${firstPlace.name || `User ${firstPlace.id}`} Avatar`}
                    width={230}
                    height={200}
                    className="rounded-full object-cover"
                  />
                </div>
              )}

              {/* Third Place */}
              {thirdPlace && (
                <div className="absolute right-[10%] flex flex-col items-center text-[#5B1B63] z-10 top-[4rem]">
                  <span className="mt-2 font-bold text-xl">{thirdPlace.name}</span>
                  <span>{sortBy === "creator_score" ? thirdPlace.creator_score : thirdPlace.participant_score}</span>
                  <Image
                    src={thirdPlace.avatar_url || "/default_avatar.png"}
                    alt={`${thirdPlace.name || `User ${thirdPlace.id}`} Avatar`}
                    width={180}
                    height={180}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Remaining Users List */}
          <div className="absolute inset-0 p-8 overflow-y-auto top-[8rem] w-[90%]">
            {loading && (
              <div className="flex justify-center items-center brightness-100">
                <Lottie animationData={loaderAnimation} loop={true} style={{ width: 160, height: 160 }} />
              </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && users.length === 0 && (
              <p className="text-white text-center">No users found</p>
            )}
            {!loading && !error && remainingUsers.length > 0 && (
              <ul className="space-y-4 w-[108%] mt-[1.5rem] ml-[1rem]">
                {remainingUsers.map((user, index) => (
                  <li
                    key={user.id}
                    className="flex items-center bg-[#f4740c6c] p-4 rounded-lg shadow-lg text-white w-[90%] h-[5rem] gap-2"
                  >
                    <div className="items-center flex justify-between w-[16%]">
                      <span className={`font-bold text-4xl ${luckiest_guy.className} pt-[0.5rem]`}>
                        {index + 4}
                      </span>
                      <Image
                        src={avatar_frame[user.avatar_url?.split("/").pop() || "fourth_avatar.webp"] || avatar_frame["fourth_avatar.webp"]}
                        alt="avatar frame"
                        height={100}
                        width={70}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="w-[90%] flex items-center justify-between text-2xl font-semibold">
                      <span className="text-2xl font-semibold">{user.name || `User ${user.id}`}</span>
                      <span className="text-end">
                        {sortBy === "creator_score" ? user.creator_score : user.participant_score} Pts
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}