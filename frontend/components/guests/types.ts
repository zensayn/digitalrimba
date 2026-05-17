export type Guest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tag: GuestTag;
  rsvpStatus: RSVPStatus;
  qrToken: string;
  notes: string;
  partySize: number;
  method: string;
  respondedAt: string;
};

export type RSVPStatus = "confirmed" | "pending" | "declined";

export type GuestTag = "family" | "vip" | "friend" | "vendor";

export type CsvGuestPreview = {
  name: string;
  phone: string;
  tag: string;
};
