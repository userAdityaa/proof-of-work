import { create } from "zustand";

type WalletState = {
  provider: unknown;
  setProvider: (provider: unknown) => void;
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
  avatarUrl: boolean | null;
  setAvatarUrl: (avatar: boolean) => void;
  connected: boolean | null;
  setWalletConnection: (connected: boolean) => void;
  userExists: boolean | null;
  setUserExists: (userExists: boolean) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
  publicKey: null,
  setPublicKey: (key) => set({ publicKey: key }),
  avatarUrl: null, 
  setAvatarUrl: (avatar) => set({ avatarUrl: avatar }),
  connected: null, 
  setWalletConnection: (connected) => set({ connected: connected }), 
  userExists: null,
  setUserExists: (userExists) => set({userExists: userExists}),
}));
