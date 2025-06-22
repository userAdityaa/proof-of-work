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

interface Submission {
  publicKey: PublicKey;
  participant: PublicKey;
  proofUrl: string;
}

interface ViewSubmissionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentChallenge: Challenge | null;
  submissions: Map<string, Submission[]>;
  handleAcceptSubmission: (submission: Submission) => Promise<void>;
  loading: boolean;
}

export default function ViewSubmissionsPopover({
  isOpen,
  onClose,
  currentChallenge,
  submissions,
  handleAcceptSubmission,
  loading,
}: ViewSubmissionsPopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-[999]"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[820px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="/view_submission_iframe.png"
          alt="View Submissions Frame"
          width={820}
          height={400}
          className="object-contain w-full"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] overflow-y-auto max-h-[400px] px-4">
          {currentChallenge && (submissions.get(currentChallenge.publicKey.toString()) || []).length > 0 ? (
            submissions.get(currentChallenge.publicKey.toString())!.map((submission) => (
              <div
                key={submission.publicKey.toString()}
                className="bg-[#FFF4C4] rounded-[1.5rem] p-6 mb-6 shadow-inner border border-[#e1c968] hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className={`text-[#5B1B63] text-lg font-extrabold ${poppins.className} mb-2`}>
                  Submission by {submission.participant.toString().slice(0, 8)}...
                </h3>
                <p className="text-[#5B1B63] text-base mb-4">
                  Proof URL: <a href={submission.proofUrl} target="_blank" rel="noopener noreferrer" className="underline">{submission.proofUrl}</a>
                </p>
                <button
                  onClick={() => handleAcceptSubmission(submission)}
                  className="w-full py-3 rounded-xl bg-[#49c553] text-white text-base font-bold hover:bg-[#3db347] transition"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Accept"}
                </button>
              </div>
            ))
          ) : (
            <p className={`text-[#5B1B63] text-lg ${poppins.className} text-center`}>No submissions for this challenge.</p>
          )}
        </div>
      </div>
    </div>
  );
}