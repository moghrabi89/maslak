import type { Metadata } from "next";
import { Tajawal, Amiri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "مسلك - درب الشافعي",
  description: "منصة تعليمية تفاعلية لدراسة الفقه الشافعي باللعب والتحفيز العلمي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ar"
        dir="rtl"
        className={`${tajawal.variable} ${amiri.variable} dark h-full antialiased`}
      >
        <body className="min-h-full bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}


