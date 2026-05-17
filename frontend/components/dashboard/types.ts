export type DashboardUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
};

export type DashboardPage = 'overview' | 'invitations' | 'guestList' | 'rsvp' | 'checkinQr' | 'budget' | 'timeline' | 'settings';
