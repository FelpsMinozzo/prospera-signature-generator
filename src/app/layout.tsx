// import type { Metadata } from "next";
// import {GeistSans} from "geist/font/sans";
// import {GeistMono} from "geist/font/mono";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "Gerador de Assinatura - Prospera",
//   description: "Crie sua assinatura de e-mail personalizada",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//       </head>
//       <body
//         className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }
// function Geist(arg0: { variable: string; subsets: string[]; }) {
//   throw new Error("Function not implemented.");
// }


import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerador de Assinatura - Prospera",
  description: "Crie sua assinatura de e-mail personalizada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}