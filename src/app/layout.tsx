/**
 * Internal app layout - not exported from the package
 * This is for development and testing purposes only
 */

import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Captify.io - Sign In",
  description: "Sign in to your Captify.io account",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}