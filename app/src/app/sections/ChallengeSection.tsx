import Image from "next/image";
import { poppins } from "@/constants/Font";
import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createChallenge, deleteChallenge, getAllChallenge, getProvider, updateChallenge, submitChallenge, getAllSubmissionsForChallenge } from "../blockchain";
import { BN } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaChallengeApplication } from "../../../../target/types/solana_challenge_application";
import { takePartChallenge } from "../blockchain";
import { acceptSubmission } from "../blockchain";

interface Challenge {
  publicKey: PublicKey;
  account: {
    cid: BN;
    owner: PublicKey;
    title: string | null;
    description: string;
    reward_amount: BN;
    participant: PublicKey[];
    imageUrl: string;
    location: string;
    rewardType: number;
    submissions: PublicKey[];
    status: BN;
  };
}

interface Submission {
  publicKey: PublicKey;
  participant: PublicKey;
  proofUrl: string;
  // Add other fields as needed based on participantSubmission account structure
}

const MAX_PARTICIPANTS = 100;
const CARDS_PER_PAGE = 3;
const ADMIN_WALLET = new PublicKey("8kw5GFcBTxdbQrDkf4jdHHiPvyG1bFPL9n9bWqPgGuYx");

export default function ChallengeSection() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [isCreatePopoverOpen, setIsCreatePopoverOpen] = useState(false);
  const [isUpdatePopoverOpen, setIsUpdatePopoverOpen] = useState(false);
  const [isDailyChallengePopoverOpen, setIsDailyChallengePopoverOpen] = useState(false);
  const [isSubmitProofPopoverOpen, setIsSubmitProofPopoverOpen] = useState(false);
  const [isViewSubmissionsPopoverOpen, setIsViewSubmissionsPopoverOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Map<string, Submission[]>>(new Map());
  const [submissionStatus, setSubmissionStatus] = useState<Map<string, boolean>>(new Map());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    rewardType: "",
    rewardAmount: "",
    proofUrl: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    rewardType: "",
    rewardAmount: "",
    proofUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<"open" | "participated" | "created">("open");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const program = useMemo(() => {
    return getProvider(publicKey, sendTransaction, signTransaction);
  }, [publicKey, sendTransaction, signTransaction]) as Program<SolanaChallengeApplication> | null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (isProofSubmission: boolean = false) => {
    const errors = {
      title: "",
      description: "",
      imageUrl: "",
      location: "",
      rewardType: "",
      rewardAmount: "",
      proofUrl: "",
    };
    let isValid = true;

    if (!isProofSubmission) {
      if (!formData.description.trim()) {
        errors.description = "Description is required";
        isValid = false;
      }
      if (!formData.rewardType.trim()) {
        errors.rewardType = "Reward Type is required";
        isValid = false;
      } else if (isNaN(parseInt(formData.rewardType)) || parseInt(formData.rewardType) < 0 || parseInt(formData.rewardType) > 255) {
        errors.rewardType = "Reward Type must be a number between 0 and 255";
        isValid = false;
      }
      if (!formData.rewardAmount.trim()) {
        errors.rewardAmount = "Reward Amount is required";
        isValid = false;
      } else if (isNaN(parseFloat(formData.rewardAmount)) || parseFloat(formData.rewardAmount) <= 0) {
        errors.rewardAmount = "Reward Amount must be a positive number";
        isValid = false;
      }
    } else {
      if (!formData.proofUrl.trim()) {
        errors.proofUrl = "Proof URL is required";
        isValid = false;
      } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.proofUrl)) {
        errors.proofUrl = "Please enter a valid URL";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const fetchChallenges = async () => {
    if (program === null || publicKey === null) {
      setErrorMessage("Wallet not connected or program not initialized. Please connect your wallet.");
      return;
    }

    setFetchLoading(true);
    setErrorMessage(null);

    try {
      const fetchedChallenges = await getAllChallenge(program);

      if (!Array.isArray(fetchedChallenges)) {
        throw new Error("Invalid data format: expected an array of challenges");
      }

      const transformedChallenges: Challenge[] = fetchedChallenges
        .filter((challenge: any) => !new BN(challenge.status).eq(new BN(3)))
        .map((challenge: any) => ({
          publicKey: new PublicKey(challenge.publicKey),
          account: {
            cid: new BN(challenge.cid),
            owner: new PublicKey(challenge.owner),
            title: challenge.title || null,
            description: challenge.description || "",
            reward_amount: new BN(challenge.rewardAmount),
            participant: (challenge.participant || []).map((p: any) => new PublicKey(p)),
            imageUrl: challenge.imageUrl || "",
            location: challenge.location || "",
            rewardType: challenge.rewardType || 0,
            submissions: (challenge.submissions || []).map((s: any) => new PublicKey(s)),
            status: new BN(challenge.status),
          },
        }));

      // Fetch submissions for each challenge and update submission status
      const submissionsMap = new Map<string, Submission[]>();
      const statusMap = new Map<string, boolean>();
      for (const challenge of transformedChallenges) {
        try {
          const challengeSubmissions = await getAllSubmissionsForChallenge(program, challenge.account.owner, challenge.account.cid);
          submissionsMap.set(challenge.publicKey.toString(), challengeSubmissions);
          const hasSubmitted = publicKey
            ? challengeSubmissions.some((submission) => submission.participant.equals(publicKey))
            : false;
          statusMap.set(challenge.publicKey.toString(), hasSubmitted);
        } catch (err: any) {
          console.error(`Error fetching submissions for challenge ${challenge.publicKey.toString()}:`, err);
          submissionsMap.set(challenge.publicKey.toString(), []);
          statusMap.set(challenge.publicKey.toString(), false);
        }
      }

      setChallenges(transformedChallenges);
      setSubmissions(submissionsMap);
      setSubmissionStatus(statusMap);
      setCurrentPage(0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMessage(`Failed to fetch challenges: ${err.message || "Unknown error"}`);
      setChallenges([]);
      setSubmissions(new Map());
      setSubmissionStatus(new Map());
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateChallengeClick = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      location: "",
      rewardType: "",
      rewardAmount: "",
      proofUrl: "",
    });
    setIsCreatePopoverOpen(true);
  };

  const handleCloseCreatePopover = () => {
    setIsCreatePopoverOpen(false);
    setFormErrors({ title: "", description: "", imageUrl: "", location: "", rewardType: "", rewardAmount: "", proofUrl: "" });
  };

  const handleCloseUpdatePopover = () => {
    setIsUpdatePopoverOpen(false);
    setCurrentChallenge(null);
    setFormErrors({ title: "", description: "", imageUrl: "", location: "", rewardType: "", rewardAmount: "", proofUrl: "" });
  };

  const handleCloseDailyChallengePopover = () => {
    setIsDailyChallengePopoverOpen(false);
    setCurrentChallenge(null);
  };

  const handleCloseSubmitProofPopover = () => {
    setIsSubmitProofPopoverOpen(false);
    setCurrentChallenge(null);
    setFormData((prev) => ({ ...prev, proofUrl: "" }));
    setFormErrors((prev) => ({ ...prev, proofUrl: "" }));
  };

  const handleCloseViewSubmissionsPopover = () => {
    setIsViewSubmissionsPopoverOpen(false);
    setCurrentChallenge(null);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (program === null || publicKey === null) {
      setFormErrors((prev) => ({ ...prev, description: "Wallet not connected or program not initialized" }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const rewardAmount = new BN(parseFloat(formData.rewardAmount) * 1e9);

      await createChallenge(
        program,
        publicKey,
        formData.title || "",
        formData.description,
        formData.imageUrl || "",
        formData.location || "",
        parseInt(formData.rewardType),
        rewardAmount
      );

      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        location: "",
        rewardType: "",
        rewardAmount: "",
        proofUrl: "",
      });
      setIsCreatePopoverOpen(false);
      await fetchChallenges();
    } catch (err: any) {
      console.error("Error creating challenge:", err);
      setFormErrors((prev) => ({ ...prev, description: `Failed to create challenge: ${err.message || "Unknown error"}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (program === null || publicKey === null || !currentChallenge) {
      setFormErrors((prev) => ({ ...prev, description: "Wallet not connected or program not initialized" }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const rewardAmount = new BN(parseFloat(formData.rewardAmount) * 1e9);

      await updateChallenge(
        program,
        publicKey,
        currentChallenge.account.cid,
        formData.title || "",
        formData.description,
        formData.imageUrl || "",
        formData.location || "",
        parseInt(formData.rewardType),
        rewardAmount
      );

      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        location: "",
        rewardType: "",
        rewardAmount: "",
        proofUrl: "",
      });
      setIsUpdatePopoverOpen(false);
      setCurrentChallenge(null);
      await fetchChallenges();
    } catch (err: any) {
      console.error("Error updating challenge:", err);
      setFormErrors((prev) => ({ ...prev, description: `Failed to update challenge: ${err.message || "Unknown error"}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (challenge: Challenge) => {
    if (!program || !publicKey) {
      setErrorMessage("Wallet not connected or program not initialized");
      return;
    }
    try {
      setCurrentChallenge(challenge);
      // submissions.get(challenge.publicKey.toString()) || [];
      setIsViewSubmissionsPopoverOpen(true);
    } catch (err: any) {
      console.error("Error viewing submissions:", err);
      setErrorMessage(`Failed to view submissions: ${err.message || "Unknown error"}`);
    }
  };

  const handleAcceptSubmission = async (submission: Submission) => {
    if (!program || !publicKey || !currentChallenge) {
      setErrorMessage("Wallet not connected or program not initialized");
      return;
    }
    setLoading(true);
    try {
      const tx = await acceptSubmission(
        program,
        currentChallenge.account.owner,
        currentChallenge.account.cid,
        submission.participant,
      );
      console.log(`Submission accepted: ${tx}`);
      await fetchChallenges(); // Refresh challenges and submissions
      await handleViewSubmission(currentChallenge); // Refresh current submissions view
    } catch (err: any) {
      console.error("Error accepting submission:", err);
      setErrorMessage(`Failed to accept submission: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (challenge: Challenge) => {
    if (!program || !publicKey) {
      setErrorMessage("Wallet not connected or program not initialized");
      return;
    }
    setCurrentChallenge(challenge);
    setFormData((prev) => ({ ...prev, proofUrl: "" }));
    setIsSubmitProofPopoverOpen(true);
  };

  const handleSubmitProofConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey || !currentChallenge) {
      setFormErrors((prev) => ({ ...prev, proofUrl: "Wallet not connected or program not initialized" }));
      return;
    }

    if (!validateForm(true)) {
      return;
    }

    setLoading(true);

    try {
      await submitChallenge(
        program,
        publicKey,
        currentChallenge.account.owner,
        currentChallenge.account.cid,
        formData.proofUrl
      );

      setFormData((prev) => ({ ...prev, proofUrl: "" }));
      setIsSubmitProofPopoverOpen(false);
      setCurrentChallenge(null);
      await fetchChallenges();
    } catch (err: any) {
      console.error("Error submitting proof:", err);
      setFormErrors((prev) => ({ ...prev, proofUrl: `Failed to submit proof: ${err.message || "Unknown error"}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChallenge = async (challenge: Challenge) => {
    if (!program || !publicKey) {
      setErrorMessage("Wallet not connected or program not initialized");
      return;
    }
    try {
      setCurrentChallenge(challenge);
      setFormData({
        title: challenge.account.title || "",
        description: challenge.account.description,
        imageUrl: challenge.account.imageUrl || "",
        location: challenge.account.location || "",
        rewardType: challenge.account.rewardType.toString(),
        rewardAmount: (challenge.account.reward_amount.toNumber() / 1e9).toString(),
        proofUrl: "",
      });
      setIsUpdatePopoverOpen(true);
    } catch (err: any) {
      console.error("Error preparing to update challenge:", err);
      setErrorMessage(`Failed to update challenge: ${err.message || "Unknown error"}`);
    }
  };

  const handleDeleteChallenge = async (challenge: Challenge) => {
    if (!program || !publicKey) return;
    try {
      await deleteChallenge(program, publicKey, challenge.account.cid);
      await fetchChallenges();
    } catch (err: any) {
      console.error("Error deleting challenge:", err);
      setErrorMessage(`Failed to delete challenge: ${err.message || "Unknown error"}`);
    }
  };

  const handleTakePart = async (challenge: Challenge) => {
    if (!program || !publicKey) {
      setErrorMessage("Wallet not connected or program not initialized");
      return;
    }

    try {
      setLoading(true);
      const cid = challenge.account.cid;
      const owner = challenge.account.owner;
      await takePartChallenge(program, publicKey, cid, owner);
      await fetchChallenges();
    } catch (err: any) {
      console.error("Error taking part in challenge:", err);
      setErrorMessage(`Failed to take part: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyChallengeClick = () => {
    setIsDailyChallengePopoverOpen(true);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * CARDS_PER_PAGE < filteredChallenges.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [program, publicKey]);

  useEffect(() => {
    if (isCreatePopoverOpen || isUpdatePopoverOpen || isDailyChallengePopoverOpen || isSubmitProofPopoverOpen || isViewSubmissionsPopoverOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCreatePopoverOpen, isUpdatePopoverOpen, isDailyChallengePopoverOpen, isSubmitProofPopoverOpen, isViewSubmissionsPopoverOpen]);

  const filteredChallenges = useMemo(() => {
    if (!publicKey) return challenges.filter((challenge) => !challenge.account.status.eq(new BN(3)));
    switch (filter) {
      case "open":
        return challenges.filter(
          (challenge) => challenge.account.owner !== ADMIN_WALLET && !challenge.account.status.eq(new BN(3))
        );
      case "participated":
        return challenges.filter(
          (challenge) =>
            challenge.account.participant.some((participant) => participant.equals(publicKey)) &&
            !challenge.account.status.eq(new BN(3))
        );
      case "created":
        return challenges.filter(
          (challenge) => challenge.account.owner.equals(publicKey) && !challenge.account.status.eq(new BN(3))
        );
      default:
        return challenges.filter(
          (challenge) => !challenge.account.owner.equals(ADMIN_WALLET) && !challenge.account.status.eq(new BN(3))
        );
    }
  }, [challenges, filter, publicKey]);

  const displayedChallenges = useMemo(() => {
    const start = currentPage * CARDS_PER_PAGE;
    return filteredChallenges.slice(start, start + CARDS_PER_PAGE);
  }, [filteredChallenges, currentPage]);

  const adminChallenges = useMemo(() => {
    if (!publicKey) {
      return challenges.filter(
        (challenge) => challenge.account.owner.equals(ADMIN_WALLET) && !challenge.account.status.eq(new BN(3))
      );
    }
    return challenges.filter(
      (challenge) =>
        challenge.account.owner.equals(ADMIN_WALLET) &&
        !challenge.account.participant.some((participant) => participant.equals(publicKey)) &&
        !challenge.account.status.eq(new BN(3))
    );
  }, [challenges, publicKey]);
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/challenge_section.png"
        alt="Landing Page Background"
        fill
        className="object-fill"
        priority
      />

      <div className="absolute top-18 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className={`text-[#5B1B63] text-6xl font-bold ${poppins.className}`}>
          Challenges
        </h1>
      </div>

      {/* Filter Buttons */}
      <div className="absolute top-[10rem] left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 rounded-xl ${filter === "open" ? "bg-[#FDD26B] text-[#5B1B63]" : "bg-white text-[#5B1B63]"} font-bold`}
        >
          Open Challenges
        </button>
        <button
          onClick={() => setFilter("participated")}
          className={`px-4 py-2 rounded-xl ${filter === "participated" ? "bg-[#FDD26B] text-[#5B1B63]" : "bg-white text-[#5B1B63]"} font-bold`}
        >
          Participated Challenges
        </button>
        <button
          onClick={() => setFilter("created")}
          className={`px-4 py-2 rounded-xl ${filter === "created" ? "bg-[#FDD26B] text-[#5B1B63]" : "bg-white text-[#5B1B63]"} font-bold`}
        >
          Created Challenges
        </button>
      </div>

      {/* Error Message and Retry Button */}
      {errorMessage && (
        <div className="absolute top-44 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
          <p className={`text-red-500 text-lg ${poppins.className}`}>{errorMessage}</p>
          <button
            onClick={() => fetchChallenges()}
            className="mt-2 px-4 py-2 bg-[#5B1B63] text-white rounded-xl"
          >
            Retry
          </button>
        </div>
      )}

      {/* Challenge Cards */}
      <div className="absolute top-[14rem] left-1/2 transform -translate-x-1/2 flex space-x-10 z-10 w-[68%]">
        {fetchLoading ? (
          <p className={`text-[#5B1B63] text-lg ${poppins.className}`}>Loading challenges...</p>
        ) : displayedChallenges.length > 0 ? (
          displayedChallenges.map((challenge, index) => (
            <div key={challenge.publicKey.toString()} className="relative flex-shrink-0 w-[30%] h-[20rem]">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  backgroundColor: "#FDD26B",
                  transform: "translate(3px, 2.5px)",
                }}
              ></div>
              <div className="relative z-10 bg-[#FFF4C4] rounded-3xl h-[320px] p-4 overflow-y-auto w-[99%] flex flex-col items-center border border-[#e9deabdb]">
                <h3 className={`text-[#5B1B63] text-xl text-center font-bold ${poppins.className} w-[100%]`}>
                  {challenge.account.title || "Untitled"}
                </h3>
                <Image src="/running_challenge.png" alt="running avatar" width={120} height={120} />
                <p className="text-[#5B1B63] text-xl -mt-[1rem] font-md text-center">{challenge.account.description}</p>
                <div className="flex items-center w-[88%] justify-between absolute bottom-[0.5rem]">
                  <div className="flex items-center space-x-2">
                    <Image src="/challenge_coin.png" alt="challenge coin" width={30} height={30} />
                    <p className="text-[#5B1B63] text-sm">
                      {(challenge.account.reward_amount.toNumber() / 1e9).toString()} SOL
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image src="/challenge_person.png" alt="challenge person" width={30} height={30} />
                    <p className="text-[#5B1B63] text-sm">
                      {challenge.account.participant.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-2 w-[99%]">
                {publicKey && challenge.account.owner.equals(publicKey) ? (
                  challenge.account.participant.length === 0 ? (
                    <>
                      <button
                        onClick={() => handleUpdateChallenge(challenge)}
                        className="w-[102%] py-2 bg-blue-500 text-white rounded-xl text-sm font-bold"
                        disabled={loading}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge)}
                        className="w-[102%] py-2 bg-red-500 text-white rounded-xl text-sm font-bold"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleViewSubmission(challenge)}
                      className="w-[102%] py-2 bg-purple-500 text-white rounded-xl text-sm font-md"
                      disabled={loading}
                    >
                      View Submission
                    </button>
                  )
                ) : publicKey && submissionStatus.get(challenge.publicKey.toString()) ? (
                  <button
                    className="w-[102%] py-2 bg-gray-500 text-white rounded-xl text-sm font-bold hover:bg-gray-600 transition"
                    disabled={true}
                  >
                    Submitted
                  </button>
                ) : publicKey && challenge.account.participant.some((participant) => participant.equals(publicKey)) ? (
                  <button
                    onClick={() => handleSubmitProof(challenge)}
                    className="w-[102%] py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition"
                    disabled={loading}
                  >
                    Submit Proof
                  </button>
                ) : publicKey && challenge.account.participant.length < MAX_PARTICIPANTS ? (
                  <button
                    onClick={() => handleTakePart(challenge)}
                    className="w-[102%] py-2 bg-green-600 text-white rounded-xl text-sm font-bold"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Take Part"}
                  </button>
                ) : null}
              </div>
              {currentPage > 0 && index === 0 && (
                <Image
                  src="/challenge_arrow.png"
                  alt="Left Arrow"
                  width={50}
                  height={30}
                  className="absolute left-[-55px] top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
                  onClick={handlePrevPage}
                />
              )}
              {(currentPage + 1) * CARDS_PER_PAGE < filteredChallenges.length && index === displayedChallenges.length - 1 && (
                <Image
                  src="/challenge_arrow.png"
                  alt="Right Arrow"
                  width={50}
                  height={30}
                  className="absolute right-[-55px] top-1/2 transform -translate-y-1/2 rotate-180 z-10 cursor-pointer"
                  onClick={handleNextPage}
                />
              )}
            </div>
          ))
        ) : (
          <p className={`text-[#5B1B63] text-2xl text-center w-[100%] h-[20rem] font-bold flex flex-col justify-center ${poppins.className}`}>
            No challenges available for this filter.
          </p>
        )}
      </div>

      {/* Buttons Container */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
        <div className="bg-[#FDD26B] rounded-2xl shadow-md h-[50px]" onClick={handleDailyChallengeClick}>
          <div className="h-[50px] flex justify-center items-center w-[15rem]">
            <Image
              src="/daily_challenge_clock.png"
              alt="Daily Challenge"
              className="object-contain"
              width={32}
              height={32}
            />
            <span className={`text-[#5B1B63] text-xl font-bold ${poppins.className}`}>
              Daily Challenge
            </span>
          </div>
        </div>
        <div
          className="bg-[#FDD26B] rounded-2xl shadow-md h-[50px]"
          onClick={handleCreateChallengeClick}
        >
          <div className="h-[50px] flex justify-center items-center w-[15rem]">
            <Image
              src="/create_challenge_icon.png"
              alt="Create Challenge"
              className="object-contain"
              width={32}
              height={32}
            />
            <span className={`text-[#5B1B63] text-xl font-bold ${poppins.className}`}>
              Create Challenge
            </span>
          </div>
        </div>
      </div>

      {/* Create Challenge Popover */}
      {isCreatePopoverOpen && (
        <div
          className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseCreatePopover}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/create_challenge_iframe.png"
              alt="Create Challenge Frame"
              width={800}
              height={400}
              className="object-contain"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5B1B63] w-[80%] overflow-y-auto max-h-[300px]">
              <div className="relative">
                <label className="block mb-1 font-bold text-xl">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter title (max 20 chars, optional)"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={20}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Description *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter description (max 256 chars)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={256}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm">{formErrors.description}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Enter image URL (max 120 chars, optional)"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={120}
                />
                {formErrors.imageUrl && (
                  <p className="text-red-500 text-sm">{formErrors.imageUrl}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location (max 20 chars, optional)"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={20}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm">{formErrors.location}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Reward Type *</label>
                <input
                  type="text"
                  name="rewardType"
                  placeholder="Enter reward type (0-255)"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                />
                {formErrors.rewardType && (
                  <p className="text-red-500 text-sm">{formErrors.rewardType}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Reward Amount *</label>
                <input
                  type="text"
                  name="rewardAmount"
                  placeholder="Enter reward amount"
                  value={formData.rewardAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                />
                {formErrors.rewardAmount && (
                  <p className="text-red-500 text-sm">{formErrors.rewardAmount}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmitCreate}
              className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#5B1B63] text-white p-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white">Creating Challenge...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Challenge Popover */}
      {isUpdatePopoverOpen && (
        <div
          className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseUpdatePopover}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/update_challenge_iframe.png"
              alt="Update Challenge Frame"
              width={800}
              height={400}
              className="object-contain"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5B1B63] w-[80%] overflow-y-auto max-h-[300px]">
              <div className="relative">
                <label className="block mb-1 font-bold text-xl">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter title (max 20 chars, optional)"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={20}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Description *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter description (max 256 chars)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={256}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm">{formErrors.description}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Enter image URL (max 120 chars, optional)"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={120}
                />
                {formErrors.imageUrl && (
                  <p className="text-red-500 text-sm">{formErrors.imageUrl}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location (max 20 chars, optional)"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={20}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm">{formErrors.location}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Reward Type *</label>
                <input
                  type="text"
                  name="rewardType"
                  placeholder="Enter reward type (0-255)"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                />
                {formErrors.rewardType && (
                  <p className="text-red-500 text-sm">{formErrors.rewardType}</p>
                )}
                <label className="block mb-1 font-bold text-xl">Reward Amount *</label>
                <input
                  type="text"
                  name="rewardAmount"
                  placeholder="Enter reward amount"
                  value={formData.rewardAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                />
                {formErrors.rewardAmount && (
                  <p className="text-red-500 text-sm">{formErrors.rewardAmount}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmitUpdate}
              className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#5B1B63] text-white p-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white">Updating Challenge...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Proof Popover */}
      {isSubmitProofPopoverOpen && (
        <div
          className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseSubmitProofPopover}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/submit_proof_iframe.png"
              alt="Submit Proof Frame"
              width={800}
              height={400}
              className="object-contain"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5B1B63] w-[80%] overflow-y-auto max-h-[300px]">
              <div className="relative">
                <label className="block mb-1 font-bold text-xl">Proof URL *</label>
                <input
                  type="text"
                  name="proofUrl"
                  placeholder="Enter proof URL (e.g., https://example.com/proof)"
                  value={formData.proofUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-1 rounded-xl bg-white text-[#5B1B63]"
                  maxLength={120}
                />
                {formErrors.proofUrl && (
                  <p className="text-red-500 text-sm">{formErrors.proofUrl}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmitProofConfirm}
              className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#5B1B63] text-white p-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Proof"}
            </button>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white">Submitting Proof...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Submissions Popover */}
      {isViewSubmissionsPopoverOpen && (
        <div
          className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseViewSubmissionsPopover}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/view_submission_iframe.png"
              alt="View Submissions Frame"
              width={820}
              height={400}
              className="object-contain"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] overflow-y-auto max-h-[400px]">
              {currentChallenge && (submissions.get(currentChallenge.publicKey.toString()) || []).length > 0 ? (
                submissions.get(currentChallenge.publicKey.toString())!.map((submission) => (
                  <div
                    key={submission.publicKey.toString()}
                    className="bg-[#FFF4C4] rounded-[1.5rem] p-6 mb-6 shadow-inner border border-[#e1c968] hover:shadow-xl transition-shadow duration-300"
                  >
                    <h3 className={`text-[#5B1B63] text-xl font-extrabold ${poppins.className} mb-2`}>
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
      )}

      {/* Daily Challenge Popover */}
      {isDailyChallengePopoverOpen && (
        <div
          className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseDailyChallengePopover}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/daily_challenge_iframe.png"
              alt="Daily Challenge Frame"
              width={820}
              height={400}
              className="object-contain"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] overflow-y-auto max-h-[400px]">
              {adminChallenges.map((challenge) => (
                <div
                  key={challenge.publicKey.toString()}
                  className="bg-[#FFF4C4] rounded-[1.5rem] p-6 mb-6 shadow-inner border border-[#e1c968] hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className={`text-[#5B1B63] text-xl font-extrabold ${poppins.className} mb-2`}>
                    {challenge.account.title || "Untitled Daily Challenge"}
                  </h3>
                  <p className="text-[#5B1B63] text-base mb-4">{challenge.account.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Image src="/challenge_coin.png" alt="coin" width={30} height={30} />
                      <p className="text-[#5B1B63] font-semibold text-sm">
                        {(challenge.account.reward_amount.toNumber() / 1e9).toString()} SOL
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image src="/challenge_person.png" alt="participants" width={30} height={30} />
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
                      className="w-full py-3 rounded-xl bg-[#FFA928] text-white text-lg font-bold shadow-md hover:bg-[#FF9A16] transition duration-300"
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
      )}
    </div>
  );
}