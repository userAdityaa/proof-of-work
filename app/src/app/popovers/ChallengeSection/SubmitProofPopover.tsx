import Image from "next/image";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../public/loader.json";
import Head from "next/head";

<Head>
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608627/my_images/submit_proof_iframe.webp"
  />
</Head>

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  rewardType: string;
  rewardAmount: string;
  proofUrl: string;
}

interface FormErrors {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  rewardType: string;
  rewardAmount: string;
  proofUrl: string;
}

interface SubmitProofPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  formErrors: FormErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function SubmitProofPopover({
  isOpen,
  onClose,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  loading,
}: SubmitProofPopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-[999]"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608627/my_images/submit_proof_iframe.webp"
          alt="Submit Proof Frame"
          width={800}
          height={400}
          className="object-contain w-full"
          priority
        />
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5B1B63] w-[80%] overflow-y-auto max-h-[300px] px-4">
          <div className="relative">
            <label className="block mb-1 font-bold text-lg">Name *</label>
            <input
              type="text"
              name="proofUrl"
              placeholder="Enter name"
              value={formData.proofUrl}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={120}
            />
            <label className="block mb-1 font-bold text-lg">Wallet Address *</label>
            <input
              type="text"
              name="proofUrl"
              placeholder="Enter wallet address"
              value={formData.proofUrl}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={120}
            />
            <label className="block mb-1 font-bold text-lg">Proof URL *</label>
            <input
              type="text"
              name="proofUrl"
              placeholder="Enter proof URL (e.g., https://example.com/proof)"
              value={formData.proofUrl}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={120}
            />
            {formErrors.proofUrl && (
              <p className="text-red-500 text-sm">{formErrors.proofUrl}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="absolute bottom-52 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#5B1B63] text-white py-2 rounded-lg font-bold"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Proof"}
        </button>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Lottie animationData={loaderAnimation} loop={true} style={{ width: 160, height: 160 }} />
          </div>
        )}
      </div>
    </div>
  );
}