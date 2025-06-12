import { useEffect } from "react";
import { useWalletStore } from "../store/walletStore";

export default function usePhantom() {
  const { provider, setProvider, publicKey, setPublicKey } = useWalletStore();

  useEffect(() => {
    if ("solana" in window) {
      const anyWindow = window as any;
      if (anyWindow.solana?.isPhantom) {
        setProvider(anyWindow.solana);
        const wasConnected = localStorage.getItem("phantomConnected");
        if (wasConnected === "true") {
          anyWindow.solana.connect({ onlyIfTrusted: true }).then((res: any) => {
            setPublicKey(res.publicKey.toString());
          }).catch(() => {
            localStorage.removeItem("phantomConnected");
          });
        }
      }
    }
  }, [setProvider, setPublicKey]);

  const connectWallet = async () => {
    if (!provider) return;
    try {
      const res = await provider.connect();
      setPublicKey(res.publicKey.toString());
      localStorage.setItem("phantomConnected", "true");
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnectWallet = async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
      setPublicKey(null);
      localStorage.removeItem("phantomConnected");
    } catch (err) {
      console.error("Disconnection failed:", err);
    }
  };

  return { connectWallet, disconnectWallet, publicKey };
}
