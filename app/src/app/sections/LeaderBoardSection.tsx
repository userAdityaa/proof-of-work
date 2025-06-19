import Image from "next/image"

export default function LeaderBoardSection() { 
    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Image
                src="/leaderboard_section.png"
                alt="Landing Page Background"
                fill
                className="object-fill"
                priority
            />

            <div className="absolute left-1/2 transform -top-24 -translate-x-1/2 flex gap-6">
                <button className="transition-transform duration-100 active:scale-95 hover:brightness-110">
                    <Image 
                        src="/creator_button.png" 
                        alt="Creator Button" 
                        width={350} 
                        height={350} 
                        className="object-contain"
                    />
                </button>
                <button className="transition-transform duration-100 active:scale-95 hover:brightness-110">
                    <Image 
                        src="/participants_button.png" 
                        alt="Participants Button" 
                        width={350} 
                        height={350} 
                        className="object-contain"
                    />
                </button>
            </div>

            <Image 
                src="/leader_board.png" 
                alt="leaderboard" 
                width={950} 
                height={1000} 
                className="absolute bottom-0 transform translate-x-[30%] translate-y-[20%]"
            />
        </div>
    )
}