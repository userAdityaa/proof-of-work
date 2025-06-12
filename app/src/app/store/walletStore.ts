import { create } from "zustand";

type WalletState = {
  provider: any;
  setProvider: (provider: any) => void;
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
  publicKey: null,
  setPublicKey: (key) => set({ publicKey: key }),
}));
