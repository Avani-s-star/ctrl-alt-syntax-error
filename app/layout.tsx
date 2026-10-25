import "./globals.css";
import Nav from "@/components/Nav";
import Aurora from "@/components/Aurora";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Team Memory",
  description: "Catch decisions your code forgot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body>
        <Aurora />
        <Nav cozy={false} />
        {children}
      </body>
    </html>
  );
}