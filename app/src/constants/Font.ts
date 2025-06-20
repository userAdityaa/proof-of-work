import { Pontano_Sans, Poppins, Luckiest_Guy } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const pontano = Pontano_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pontano",
});

export const luckiest_guy = Luckiest_Guy({
  subsets: ["latin"],
  weight: ["400"],
})

