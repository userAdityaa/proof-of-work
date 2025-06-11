import type { Metadata } from "next";
import { Inter} from "next/font/google";
import "./globals.css";
import AppProvider from "./providers"; 
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
 
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
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider session={session}>{children}</AppProvider>
      </body>
    </html>
  );
}