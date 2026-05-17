import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rimba Check-in",
};

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
