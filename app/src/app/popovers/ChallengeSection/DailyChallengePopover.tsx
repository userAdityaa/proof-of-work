import Image from "next/image";
import { poppins } from "@/constants/Font";
import { PublicKey } from "@solana/web3.js";

interface Challenge {
  publicKey: PublicKey;
  account: {
    cid: any;
    owner: PublicKey;
    title: string | null;
    description: string;
    reward_amount: any;
    participant: PublicKey[];
    imageUrl: string;
    location: string;
    rewardType: number;
    submissions: PublicKey[];
    status: any;
  };
}

interface DailyChallengePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  adminChallenges: Challenge[];
  publicKey: PublicKey | null;
  submissionStatus: Map<string, boolean>;
  handleTakePart: (challenge: Challenge) => Promise<void>;
  handleUpdateChallenge: (challenge: Challenge) => Promise<void>;
  handleDeleteChallenge: (challenge: Challenge) => Promise<void>;
  handleViewSubmission: (challenge: Challenge) => Promise<void>;
  handleSubmitProof: (challenge: Challenge) => Promise<void>;
  loading: boolean;
}

const MAX_PARTICIPANTS = 100;
const ADMIN_WALLET = new PublicKey("8kw5GFcBTxdbQrDkf4jdHHiPvyG1bFPL9n9bWqPgGuYx");

export default function DailyChallengePopover({
  isOpen,
  onClose,
  adminChallenges,
  publicKey,
  submissionStatus,
  handleTakePart,
  handleUpdateChallenge,
  handleDeleteChallenge,
  handleViewSubmission,
  handleSubmitProof,
  loading,
}: DailyChallengePopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-[99999]"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[820px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608225/my_images/daily_challenge_iframe.webp"
          alt="Daily Challenge Frame"
          width={820}
          height={400}
          className="object-contain w-full"
          priority
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] overflow-y-auto max-h-[400px] px-4">
          {adminChallenges.map((challenge) => (
            <div
              key={challenge.publicKey.toString()}
              className="bg-[#FFF4C4] rounded-[1.5rem] p-6 mb-6 shadow-inner border border-[#e1c968] hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className={`text-[#5B1B63] text-lg font-extrabold ${poppins.className} mb-2`}>
                {challenge.account.title || "Untitled Daily Challenge"}
              </h3>
              <p className="text-[#5B1B63] text-base mb-4">{challenge.account.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Image src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608205/my_images/challenge_coin.webp" alt="coin" width={24} height={24} priority/>
                  <p className="text-[#5B1B63] font-semibold text-sm">
                    {(challenge.account.reward_amount.toNumber() / 1e9).toString()} SOL
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Image src="/challenge_person.png" alt="participants" width={24} height={24} />
                  <p className="text-[#5B1B63] font-semibold text-sm">
                    {challenge.account.participant.length} / {MAX_PARTICIPANTS}
                  </p>
                </div>
              </div>
              <div className="w-full bg-[#e9cf7b] h-6 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-[#49c553] h-6 rounded-full transition-all duration-300 text-white font-bold text-xs flex items-center justify-center"
                  style={{ width: `${(challenge.account.participant.length / MAX_PARTICIPANTS) * 100}%` }}
                >
                </div>
              </div>
              {publicKey && !publicKey.equals(ADMIN_WALLET) && !challenge.account.participant.some((p) => p.equals(publicKey)) && challenge.account.participant.length < MAX_PARTICIPANTS && (
                <button
                  onClick={() => handleTakePart(challenge)}
                  className="w-full py-3 rounded-xl bg-[#FFA928] text-white text-base font-bold shadow-md hover:bg-[#FF9A16] transition duration-300"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Claim"}
                </button>
              )}
              {publicKey && publicKey.equals(ADMIN_WALLET) && (
                <>
                  {challenge.account.participant.length === 0 ? (
                    <>
                      <button
                        onClick={() => handleUpdateChallenge(challenge)}
                        className="w-full py-3 rounded-xl bg-[#4D9AF6] text-white text-base font-bold mb-3 hover:bg-[#3f8ae0] transition"
                        disabled={loading}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge)}
                        className="w-full py-3 rounded-xl bg-[#F25A5A] text-white text-base font-bold hover:bg-[#d94f4f] transition"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleViewSubmission(challenge)}
                      className="w-full py-3 rounded-xl bg-[#9A56D1] text-white text-base font-medium hover:bg-[#8646c0] transition"
                      disabled={loading}
                    >
                      View Submission
                    </button>
                  )}
                </>
              )}
              {publicKey && challenge.account.participant.some((p) => p.equals(publicKey)) && (
                <button
                  onClick={() => handleSubmitProof(challenge)}
                  className={`w-full py-3 rounded-xl ${submissionStatus.get(challenge.publicKey.toString()) ? "bg-gray-500" : "bg-orange-500"} text-white text-base font-bold hover:${submissionStatus.get(challenge.publicKey.toString()) ? "bg-gray-600" : "bg-orange-600"} transition`}
                  disabled={loading || submissionStatus.get(challenge.publicKey.toString())}
                >
                  {submissionStatus.get(challenge.publicKey.toString()) ? "Submitted" : "Submit Proof"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}