import Image from "next/image";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../public/loader.json";

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

interface CreateChallengePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  formErrors: FormErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function CreateChallengePopover({
  isOpen,
  onClose,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  loading,
}: CreateChallengePopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex justify-center items-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="https://res.cloudinary.com/dhkqyhdqu/image/upload/v1750608215/my_images/create_challenge_iframe.webp"
          alt="Create Challenge Frame"
          width={800}
          height={400}
          className="object-contain w-full"
          priority
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5B1B63] w-[80%] overflow-y-auto max-h-[300px] px-4">
          <div className="relative">
            <label className="block mb-1 font-bold text-lg">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter title (max 20 chars, optional)"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={20}
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm">{formErrors.title}</p>
            )}
            <label className="block mb-1 font-bold text-lg">Description *</label>
            <input
              type="text"
              name="description"
              placeholder="Enter description (max 256 chars)"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={256}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm">{formErrors.description}</p>
            )}
            <label className="block mb-1 font-bold text-lg">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Enter image URL (max 120 chars, optional)"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={120}
            />
            {formErrors.imageUrl && (
              <p className="text-red-500 text-sm">{formErrors.imageUrl}</p>
            )}
            <label className="block mb-1 font-bold text-lg">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter location (max 20 chars, optional)"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
              maxLength={20}
            />
            {formErrors.location && (
              <p className="text-red-500 text-sm">{formErrors.location}</p>
            )}
            <label className="block mb-1 font-bold text-lg">Reward Type *</label>
            <input
              type="text"
              name="rewardType"
              placeholder="Enter reward type (0 > SOL, 1 > NFT)"
              value={formData.rewardType}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
            />
            {formErrors.rewardType && (
              <p className="text-red-500 text-sm">{formErrors.rewardType}</p>
            )}
            <label className="block mb-1 font-bold text-lg">Reward Amount *</label>
            <input
              type="text"
              name="rewardAmount"
              placeholder="Enter reward amount"
              value={formData.rewardAmount}
              onChange={handleInputChange}
              className="w-full p-2 mb-1 rounded-md bg-white text-[#5B1B63]"
            />
            {formErrors.rewardAmount && (
              <p className="text-red-500 text-sm">{formErrors.rewardAmount}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#5B1B63] text-white py-2 rounded-lg font-bold"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur bg-opacity-50">
            <Lottie animationData={loaderAnimation} loop={true} style={{ width: 160, height: 160 }} />
          </div>
        )}
      </div>
    </div>
  );
}