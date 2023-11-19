import ClientProvider from "../client";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Image processor",
  description: "Make math explanations based on image",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <html lang="en">
        <body className={inter.className + ` min-w-screen min-h-screen`}>{children}</body>
      </html>
    </ClientProvider>
  );
}
