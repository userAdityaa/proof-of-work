import Image from "next/image";
import { useState, useEffect } from "react";
import { luckiest_guy } from "@/constants/Font";

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
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
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
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/leaderboard_section.png"
        alt="Landing Page Background"
        fill
        className="object-fill"
        priority
      />

      <div className="absolute left-1/2 top-[-6rem] -translate-x-1/2 flex gap-6">
        <button
          className={`transition-transform duration-100 active:scale-95 hover:brightness-110 ${sortBy === "creator_score" ? "opacity-100" : "opacity-70"}`}
          onClick={() => setSortBy("creator_score")}
          aria-label="View Creator Leaderboard"
        >
          <Image
            src="/creator_button.png"
            alt="Creator Button"
            width={350}
            height={350}
            className="object-contain"
          />
        </button>
        <button
          className={`transition-transform duration-100 active:scale-95 hover:brightness-110 ${sortBy === "participant_score" ? "opacity-100" : "opacity-70"}`}
          onClick={() => setSortBy("participant_score")}
          aria-label="View Participant Leaderboard"
        >
          <Image
            src="/participants_button.png"
            alt="Participants Button"
            width={350}
            height={350}
            className="object-contain"
          />
        </button>
      </div>

      {!loading && !error && topThreeUsers.length > 0 && (
        <div className="relative flex justify-center items-end h-[15rem] w-full top-44">
            
            {/* Second Place */}
            {secondPlace && (
            <div className="absolute left-[22%] flex flex-col items-center text-[#5B1B63] z-10 top-[0.1rem]">
                <span className="mt-2 font-bold text-xl">{secondPlace.name}</span>
                <span>{sortBy === "creator_score" ? secondPlace.creator_score : secondPlace.participant_score}</span>
                <Image
                src={secondPlace.avatar_url || "/default_avatar.png"}
                alt={`${secondPlace.name || `User ${secondPlace.id}`} Avatar`}
                width={200}
                height={200}
                className="rounded-full object-cover"
                />
            </div>
            )}

            {/* First Place */}
            {firstPlace && (
            <div className="flex flex-col items-center text-[#5B1B63] z-20">
                <span className="mt-2 font-bold text-xl">{firstPlace.name}</span>
                <span>{sortBy === "creator_score" ? firstPlace.creator_score : firstPlace.participant_score}</span>
                <Image
                src={firstPlace.avatar_url || "/default_avatar.png"}
                alt={`${firstPlace.name || `User ${firstPlace.id}`} Avatar`}
                width={240}
                height={240}
                className="rounded-full object-cover"
                />
            </div>
            )}

            {/* Third Place */}
            {thirdPlace && (
            <div className="absolute right-[22%] flex flex-col items-center text-[#5B1B63] z-10 top-[0.1rem]">
                <span className="mt-2 font-bold text-xl">{thirdPlace.name}</span>
                <span>{sortBy === "creator_score" ? thirdPlace.creator_score : thirdPlace.participant_score}</span>
                <Image
                src={thirdPlace.avatar_url || "/default_avatar.png"}
                alt={`${thirdPlace.name || `User ${thirdPlace.id}`} Avatar`}
                width={200}
                height={200}
                className="rounded-full object-cover"
                />
            </div>
            )}
        </div>
        )}

      {/* Leaderboard for Users Starting from Position 4 */}
      <div className="absolute -bottom-[38rem] right-[15%] w-[950px] h-[1000px]">
        <Image
          src="/leader_board.png"
          alt="Leaderboard"
          width={950}
          height={1000}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 p-8 overflow-y-auto top-[8rem]">
          {loading && <p className="text-white text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && users.length === 0 && (
            <p className="text-white text-center">No users found</p>
          )}
          {!loading && !error && remainingUsers.length > 0 && (
            <ul className="space-y-4">
              {remainingUsers.map((user, index) => (
                <li
                  key={user.id}
                  className="flex items-center bg-[#f593099a] p-4 rounded-lg shadow-lg text-white w-[90%] h-[5rem] gap-2"
                >

                <div className="items-center flex justify-between w-[16%]">
                    <span className={`font-bold text-4xl ${luckiest_guy.className} pt-[0.5rem]`}>
                        {index + 4} 
                    </span>

                    <Image src = "/avatar_one_frame.png"
                        alt="avatar frame"
                        height={100}
                        width={70}
                        className="rounded-lg"
                    >
                    </Image>
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
  );
}