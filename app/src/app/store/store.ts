import { create } from "zustand";

type WalletState = {
  provider: any;
  setProvider: (provider: any) => void;
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
  avatarUrl: boolean | null;
  setAvatarUrl: (avatar: boolean) => void;
  connected: boolean | null;
  setWalletConnection: (connected: boolean) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
  publicKey: null,
  setPublicKey: (key) => set({ publicKey: key }),
  avatarUrl: null, 
  setAvatarUrl: (avatar) => set({ avatarUrl: avatar }),
  connected: null, 
  setWalletConnection: (connected) => set({ connected: connected })
}));
