const PHOTO_CDN = process.env.NEXT_PUBLIC_PHOTOS_CDN ?? "https://assets-invitations.rimba.io";

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const invitationPhoto = (pathOrUrl: string) =>
  isAbsoluteUrl(pathOrUrl)
    ? pathOrUrl
    : `${PHOTO_CDN}/${pathOrUrl.replace(/^\/+/, "")}`;

// Katalog lagu bersama di bucket `rimba-invitations` folder `music/catalog/`
// (CDN sama dengan foto). Terima nama file katalog atau URL penuh.
export const invitationMusic = (fileOrUrl: string) =>
  isAbsoluteUrl(fileOrUrl)
    ? fileOrUrl
    : `${PHOTO_CDN}/music/catalog/${fileOrUrl.replace(/^\/+/, "")}`;
