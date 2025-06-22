import Image from "next/image";

export default function About() {
  return (
    <>
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center overflow-x-hidden shake-animation">
      <Image
        src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697840/leaderboard_section-1_tzg0l6.webp"
        alt="About Page Background"
        fill
        className="object-cover border"
        priority
      />
      <Image
        src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750697593/txg57gqxt9eavo1dikso_ew2c4e.webp"
        alt="About Section Image"
        width={1500}
        height={1500}
        className="relative z-10 max-w-[80%] max-h-[80%] object-contain scale-[135%]"
        priority
      />

        <div className={`absolute z-100 w-[29%] text-yellow-950 opacity-90 left-[15rem] flex flex-col gap-12 h-[70%]`}>
        <h1 className="text-[2.4rem] font-bold">About this application</h1>
        <p className="text-2xl">Built on Solana, our app brings real-world and quirky challenges to life. Users can create, join, and complete challenges, including daily ones with special perks,  while earning NFTs as proof of completion. With smooth UI, on-chain transactions, and dynamic animations, the platform features a leaderboard, reputation system, and upcoming features like gated rewards and community verification.</p>
      </div>
    </div>
    </>
  );
}
