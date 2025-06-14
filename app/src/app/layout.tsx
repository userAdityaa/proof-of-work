import type { Metadata } from "next";
import { Inter} from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/provider/SolanaProvider";
 
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proof of Adventure",
  // description: "Next.js app integrated with Okto SDK and Google Authentication",
  icons: {
    icon: './logo.png'
  }
};
 
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}