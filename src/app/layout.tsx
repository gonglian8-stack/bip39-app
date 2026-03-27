import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'BIP39.ai - AI-Powered Mnemonic Code Converter',
  description: 'Generate, validate, and analyze BIP39 mnemonic phrases with AI-powered security analysis. Supports BIP44/49/84/86 derivation paths and 30+ cryptocurrencies.',
  keywords: 'BIP39, mnemonic, Bitcoin, wallet, seed phrase, HD wallet, BIP44, BIP84, BIP86, Taproot, crypto, AI security',
  openGraph: {
    title: 'BIP39.ai - AI-Powered Mnemonic Code Converter',
    description: 'Generate and analyze BIP39 mnemonic phrases with AI security analysis',
    url: 'https://bip39.ai',
    siteName: 'BIP39.ai',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0e1a] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
