import Image from "next/image";
import { poppins } from "@/constants/Font";
import { useState, useEffect, useMemo, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createChallenge, deleteChallenge, getAllChallenge, getProvider, updateChallenge, submitChallenge, getAllSubmissionsForChallenge } from "../blockchain";
import { BN } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaChallengeApplication } from "../../../../target/types/solana_challenge_application";
import { takePartChallenge } from "../blockchain";
import { acceptSubmission } from "../blockchain";
import Lottie from "lottie-react";
import loaderAnimation from "../../../public/loader.json";
import CreateChallengePopover from "../popovers/ChallengeSection/CreateChallengePopover";
import UpdateChallengePopover from "../popovers/ChallengeSection/UpdateChallengePopover";
import SubmitProofPopover from "../popovers/ChallengeSection/SubmitProofPopover";
import ViewSubmissionsPopover from "../popovers/ChallengeSection/ViewSubmissionPopover";
import DailyChallengePopover from "../popovers/ChallengeSection/DailyChallengePopover";

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
}

const MAX_PARTICIPANTS = 100;
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
  // const [currentPage, setCurrentPage] = useState(0);
  const cardContainerRef = useRef<HTMLDivElement>(null);

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
      // setCurrentPage(0);
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
      await fetchChallenges();
      await handleViewSubmission(currentChallenge);
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
      throw err;
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
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollBy({
        left: cardContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevPage = () => {
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollBy({
        left: -cardContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
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
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="/challenge_section.png"
        alt="Landing Page Background"
        fill
        className="object-fill hidden md:block scale-[115%] min-[1500]:scale-[105%]"
        priority
      />

      <Image
        src="/challenge_section_phone.png"
        alt="Landing Page Background"
        fill
        className="object-cover md:hidden"
        priority
      />

      {/* Filter Buttons */}
      <div className="absolute top-4 max-md:top-[9.2rem] min-[1500]:top-[5rem] min-md:left-[49%] transform min-md:-translate-x-1/2 flex min-md:flex-wrap max-md:flex-nowrap justify-center items-center px-4 max-md:px-0 w-[85rem] max-md:w-[90vw] left-[5%]">
        <div className="transition-transform duration-100 mb-0.5 min-md:-mr-[2rem] active:scale-95 hover:brightness-110 min-[1500]:w-[20rem] max-md:w-[9.5rem]" onClick={handleDailyChallengeClick}>
          <Image
            src="/daily_challenge_button.png"
            alt="Daily Challenges Button"
            width={108}
            height={110}
            className="object-contain min-[1500]:w-[20rem] max-md:w-[30rem]"
          />
        </div>
        <button
          className={`transition-transform max-md:hidden duration-100 active:scale-95 hover:brightness-110 ${filter === "open" ? "opacity-100" : "opacity-70 "}`}
          onClick={() => setFilter("open")}
          aria-label="View Open Challenges"
        >
          <Image
            src="/open_challenge_button.png"
            alt="Open Challenges Button"
            width={260}
            height={240}
            className="object-contain min-[1500]:w-[20rem]"
          />
        </button>

        <button
          className={`transition-transform min-md:hidden duration-100 active:scale-95 hover:brightness-110 ${filter === "open" ? "opacity-100" : "opacity-70 "}`}
          onClick={() => setFilter("open")}
          aria-label="View Open Challenges"
        >
          <Image
            src="/open_challenge_phone_button.png"
            alt="Open Challenges Button"
            width={108}
            height={108}
            className="object-contain min-[1500]:w-[20rem] max-md:w-[8rem]"
          />
        </button>

        <button
          onClick={() => setFilter("participated")}
          className={`transition-transform mb-2 max-md:hidden duration-100 active:scale-95 hover:brightness-110 ${filter === "participated" ? "opacity-100" : "opacity-70"}`}
        >
          <Image
            src="/participated_challenge_button.png"
            alt="Participated Challenges Button"
            width={325}
            height={240}
            className="object-contain min-[1500]:w-[20rem]"
          />
        </button>

        <button
          onClick={() => setFilter("participated")}
          className={`transition-transform min-md:hidden duration-100 active:scale-95 hover:brightness-110 ${filter === "participated" ? "opacity-100" : "opacity-70"}`}
        >
          <Image
            src="/participated_challenge_phone_button.png"
            alt="Open Challenges Button"
            width={108}
            height={108}
            className="object-contain min-[1500]:w-[20rem] max-md:w-[8rem]"
          />
        </button>

        <button
          onClick={() => setFilter("created")}
          className={`transition-transform mb-2 duration-100 max-md:hidden active:scale-95 hover:brightness-110 ${filter === "created" ? 
            "opacity-100" : "opacity-70"}`}
        >
          <Image
            src="/created_challenge_button.png"
            alt="Participated Challenges Button"
            width={325}
            height={240}
            className="object-contain min-[1500]:w-[20rem]"
          />
        </button>

        <button
          onClick={() => setFilter("created")}
          className={`transition-transform min-md:hidden duration-100 active:scale-95 hover:brightness-110 ${filter === "created" ? 
            "opacity-100" : "opacity-70"}`}
        >
          <Image
            src="/created_challenge_phone_button.png"
            alt="Open Challenges Button"
            width={108}
            height={108}
            className="object-contain min-[1500]:w-[20rem] max-md:w-[8rem]"
          />
        </button>
      </div>

      {/* Error Message and Retry Button */}
      {errorMessage && (
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center px-4">
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
      <div className="relative top-48 min-[1500]:top-80 w-[90%] max-[1500]:max-w-[1080px] min-[1500]:w-[1270px] min-[1500]:border mx-auto px-4 md:px-6 lg:px-16">
        {fetchLoading ? (
          <div className="flex justify-center items-center h-[26rem]">
            <Lottie animationData={loaderAnimation} loop={true} style={{ width: 160, height: 160 }} />
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="relative">
            <div 
              ref={cardContainerRef}
              className="grid grid-flow-col auto-cols-[minmax(280px,320px)] max-md:ml-[0.8rem] max-md:gap-8 min-[1500]:gap-16 max-[1500]:md:gap-10 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {filteredChallenges.map((challenge) => (
                <div 
                  key={challenge.publicKey.toString()} 
                  className="snap-start w-[300px] md:w-[300px] min-w-[280px] flex-shrink-0"
                >
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-3xl h-[340px] md:h-[361px]"
                      style={{
                        backgroundColor: "#FDD26B",
                        transform: "translate(3px, 2.5px)",
                      }}
                    ></div>
                    <div className="relative z-10 bg-[#FFF4C4] rounded-3xl h-[340px] md:h-[360px] max-md:mt-[3rem] p-5 overflow-y-auto flex flex-col items-center border border-[#e9deabdb]">
                      <h3 className={`text-[#5B1B63] text-xl md:text-2xl text-center font-bold ${poppins.className} w-full truncate`}>
                        {challenge.account.title || "Untitled"}
                      </h3>
                      <Image 
                        src="/running_challenge.png" 
                        alt="running avatar" 
                        width={140} 
                        height={140} 
                        className="object-contain"
                      />
                      <p className="text-[#5B1B63] text-base md:text-lg -mt-2 font-medium text-center line-clamp-3">
                        {challenge.account.description}
                      </p>
                      <div className="flex items-center w-[90%] justify-between absolute bottom-3">
                        <div className="flex items-center space-x-2">
                          <Image src="/challenge_coin.png" alt="challenge coin" width={28} height={28} />
                          <p className="text-[#5B1B63] text-sm md:text-base">
                            {(challenge.account.reward_amount.toNumber() / 1e9).toString()} SOL
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Image src="/challenge_person.png" alt="challenge person" width={28} height={28} />
                          <p className="text-[#5B1B63] text-sm md:text-base">
                            {challenge.account.participant.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 mt-2">
                      {publicKey && challenge.account.owner.equals(publicKey) ? (
                        challenge.account.participant.length === 0 ? (
                          <>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateChallenge(challenge)}
                                className="w-64 py-2 bg-blue-500 text-white rounded-xl text-sm md:text-base font-bold disabled:opacity-50"
                                disabled={loading}
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDeleteChallenge(challenge)}
                                className="p-2 bg-red-500 text-white rounded-xl disabled:opacity-50"
                                disabled={loading}
                                title="Delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                            </button>
                          </div>
                          </>
                        ) : (
                          <button
                            onClick={() => handleViewSubmission(challenge)}
                            className="w-full py-2 bg-purple-500 text-white rounded-xl text-sm md:text-base font-medium"
                            disabled={loading}
                          >
                            View Submission
                          </button>
                        )
                      ) : publicKey && submissionStatus.get(challenge.publicKey.toString()) ? (
                        <button
                          className="w-full py-2 bg-gray-500 text-white rounded-xl text-sm md:text-base font-bold hover:bg-gray-600 transition"
                          disabled={true}
                        >
                          Submitted
                        </button>
                      ) : publicKey && challenge.account.participant.some((participant) => participant.equals(publicKey)) ? (
                        <button
                          onClick={() => handleSubmitProof(challenge)}
                          className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm md:text-base font-bold hover:bg-orange-600 transition"
                          disabled={loading}
                        >
                          Submit Proof
                        </button>
                      ) : publicKey && challenge.account.participant.length < MAX_PARTICIPANTS ? (
                        <button
                          onClick={() => handleTakePart(challenge)}
                          className="w-full py-2 bg-green-600 text-white rounded-xl text-sm md:text-base font-bold"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Take Part"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredChallenges.length > 1 && (
              <>
                <Image
                  src="/challenge_arrow.png"
                  alt="Left Arrow"
                  width={56}
                  height={24}
                  className="absolute -left-[2rem] md:-left-[4rem] md:top-[40%] top-[50%] transform -translate-y-1/2 z-10 cursor-pointer hover:opacity-80"
                  onClick={handlePrevPage}
                />
                <Image
                  src="/challenge_arrow.png"
                  alt="Right Arrow"
                  width={56}
                  height={24}
                  className="absolute -right-[2rem] md:-right-[4rem] md:top-[40%] top-[50%] transform -translate-y-1/2 rotate-180 z-10 cursor-pointer hover:opacity-80"
                  onClick={handleNextPage}
                />
              </>
            )}
          </div>
        ) : (
          <p className={`text-[#5B1B63] text-3xl text-center w-full py-16 h-[26rem] flex items-center justify-center font-bold ${poppins.className}`}>
            No challenges available for this filter.
          </p>
        )}
      </div>

      {/* Buttons Container */}
      <div className="absolute bottom-24 max-md:bottom-52 min-[1500]:bottom-60 left-1/2 transform -translate-x-1/2 flex max-md:w-[24rem] flex-wrap justify-center gap-4 z-50 px-4">
        <div
            className="bg-[#FFC949] rounded-xl h-12 min-[1500]:p-7 border-2 border-[#420E40] flex items-center justify-center max-md:w-[9.5rem] w-[12rem] min-[1500]:w-[22rem]"
          onClick={handleCreateChallengeClick}
        >
          <span className={`text-black  text-lg max-md:text-[15.5px] font-bold ${poppins.className} min-[1500]:text-[30px]`}>
            Create Challenge
          </span>
        </div>
      </div>

      {/* Popovers */}
      <CreateChallengePopover
        isOpen={isCreatePopoverOpen}
        onClose={() => setIsCreatePopoverOpen(false)}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitCreate}
        loading={loading}
      />

      <UpdateChallengePopover
        isOpen={isUpdatePopoverOpen}
        onClose={() => {
          setIsUpdatePopoverOpen(false);
          setCurrentChallenge(null);
          setFormErrors({ title: "", description: "", imageUrl: "", location: "", rewardType: "", rewardAmount: "", proofUrl: "" });
        }}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitUpdate}
        loading={loading}
      />

      <SubmitProofPopover
        isOpen={isSubmitProofPopoverOpen}
        onClose={() => {
          setIsSubmitProofPopoverOpen(false);
          setCurrentChallenge(null);
          setFormData((prev) => ({ ...prev, proofUrl: "" }));
          setFormErrors((prev) => ({ ...prev, proofUrl: "" }));
        }}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitProofConfirm}
        loading={loading}
      />

      <ViewSubmissionsPopover
        isOpen={isViewSubmissionsPopoverOpen}
        onClose={() => {
          setIsViewSubmissionsPopoverOpen(false);
          setCurrentChallenge(null);
        }}
        currentChallenge={currentChallenge}
        submissions={submissions}
        handleAcceptSubmission={handleAcceptSubmission}
        loading={loading}
      />

      <DailyChallengePopover
        isOpen={isDailyChallengePopoverOpen}
        onClose={() => {
          setIsDailyChallengePopoverOpen(false);
          setCurrentChallenge(null);
        }}
        adminChallenges={adminChallenges}
        publicKey={publicKey}
        submissionStatus={submissionStatus}
        handleTakePart={handleTakePart}
        handleUpdateChallenge={handleUpdateChallenge}
        handleDeleteChallenge={handleDeleteChallenge}
        handleViewSubmission={handleViewSubmission}
        handleSubmitProof={handleSubmitProof}
        loading={loading}
      />
    </div>
  );
}