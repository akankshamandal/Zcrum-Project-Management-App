import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Inter } from "next/font/google";
import Header from "@/components/ui/header";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zcrum",
  description: "Project Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
  appearance={{
    theme: shadesOfPurple,
    variables: {
      colorPrimary: "#3b82f6",    
      colorBackground: "#1a202c",
    },
    elements: {
      formFieldInput: {
        backgroundColor: "#2D3748",
        color: "#F3F4F6",
      },

      formButtonPrimary: {
        backgroundColor: "#3b82f6",
        color: "#ffffff",           
      },

      headerTitle: {
        color: "#60A5FA",          
      },

      headerSubtitle: {
        color: "#9CA3AF",          
      },

      card: {
        backgroundColor: "#1F2937",
      },
    },
  }}
>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} dotted-background` }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">

          {children}
          </main>
          <Toaster richColors/>
          <footer className="bg-gray-900 py-12">
            <div className="container mx-auto px-4 text-center text-gray-200">
            <p>Made with love 💕 by Akanksha.</p>
            </div>
            </footer>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}