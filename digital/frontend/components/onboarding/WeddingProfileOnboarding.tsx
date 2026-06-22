"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  AltArrowLeft,
  ArrowRight,
  CalendarMark,
  CheckCircle,
  MapPoint,
  UsersGroupRounded,
} from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import { fetchWeddingProfile, saveWeddingProfile, type WeddingProfile } from "@/lib/api/weddings";
import { getWeddingProfileRedirectPath } from "@/lib/wedding-profile-routing";

// Strong ease-out curve (emil-design-eng) — built-in easings lack punch.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Cover photo for the live invitation card (Luma-style image-led artifact).
const COVER_IMG =
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80&auto=format&fit=crop";

export default function WeddingProfileOnboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const [started, setStarted] = useState(false);
  const [coupleName, setCoupleName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<WeddingProfile | null>(null);

  const profileQuery = useQuery({
    queryKey: ["wedding", "profile"],
    queryFn: fetchWeddingProfile,
  });

  const saveMutation = useMutation({
    mutationFn: saveWeddingProfile,
    onSuccess: (profile) => setSavedProfile(profile), // → celebration screen
  });

  // Existing profile (returning user) → bounce to the right place before we render the form.
  // Suppressed once we have a freshly-saved profile so the celebration screen isn't skipped.
  const redirectPath =
    profileQuery.isSuccess && !savedProfile
      ? getWeddingProfileRedirectPath(profileQuery.data, pathname)
      : null;

  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  function handleSubmit() {
    if (!coupleName.trim()) {
      setFormError("Add the couple's name to continue.");
      return;
    }
    setFormError(null);
    saveMutation.mutate({
      couple_name: coupleName.trim(),
      event_date: eventDate.trim(),
      venue_name: venueName.trim(),
      venue_address: venueAddress.trim(),
    });
  }

  function enterDashboard() {
    if (savedProfile) {
      queryClient.setQueryData(["wedding", "profile"], savedProfile);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    }
    router.replace("/dashboard");
  }

  if (profileQuery.isLoading || (redirectPath && !savedProfile)) {
    return <OnboardingStatus title="Preparing onboarding" description="Checking your wedding profile…" />;
  }

  if (profileQuery.isError) {
    return (
      <OnboardingStatus
        title="Onboarding unavailable"
        description={profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
      />
    );
  }

  // Welcome screen — Apple Invites carousel on Cohere's white canvas (unchanged).
  if (!started) {
    return <WelcomeScreen reduceMotion={reduceMotion ?? false} onStart={() => setStarted(true)} />;
  }

  // Celebration — fresh save complete.
  if (savedProfile) {
    return (
      <main className="flex min-h-screen flex-col bg-white text-clay-ink">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 pt-14">
          <CelebrationView profile={savedProfile} reduceMotion={reduceMotion ?? false} onEnter={enterDashboard} />
        </div>
      </main>
    );
  }

  // The form — Luma-style single create screen: image-led cover artifact + grouped fields.
  return (
    <main className="flex min-h-screen flex-col bg-white text-clay-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14">
        {/* Back (left chevron) + brand (centered) */}
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setStarted(false)}
            aria-label="Back"
            className="absolute left-0 grid size-9 place-items-center rounded-full text-neutral-500 transition-all duration-200 ease-out hover:bg-neutral-100 hover:text-clay-ink active:scale-[0.94]"
          >
            <AltArrowLeft size={20} />
          </button>
          <BrandLogo />
        </header>

        <div className="mt-10 space-y-2 text-center">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-clay-ink md:text-[28px]">
            Create your wedding
          </h1>
          <p className="text-sm leading-6 text-neutral-500">
            Fill in the details — your invitation updates as you type.
          </p>
        </div>

        {/* Live invitation cover — the artifact you're building */}
        <div className="mt-7">
          <CoverCard
            coupleName={coupleName}
            eventDate={eventDate}
            venueName={venueName}
            venueAddress={venueAddress}
          />
        </div>

        {/* Grouped field rows (Luma) */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e9e3d2] bg-clay-canvas divide-y divide-[#e9e3d2]">
          <FieldRow icon={<UsersGroupRounded size={18} />} label="Couple name">
            <input
              autoFocus
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              placeholder="Alya & Bima"
              className={FIELD_INPUT}
            />
          </FieldRow>
          <FieldRow icon={<CalendarMark size={18} />} label="Event date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={`${FIELD_INPUT} text-neutral-700`}
            />
          </FieldRow>
          <FieldRow icon={<MapPoint size={18} />} label="Venue">
            <input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Rimba Glass House"
              className={FIELD_INPUT}
            />
          </FieldRow>
          <FieldRow icon={<MapPoint size={18} />} label="Address">
            <input
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Jakarta, Indonesia"
              className={FIELD_INPUT}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </FieldRow>
        </div>

        {(formError || saveMutation.isError) && (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError ??
              (saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Unable to save wedding profile.")}
          </p>
        )}

        {/* Create — single full-width pill */}
        <TextureButton
          type="button"
          variant="primary"
          disabled={saveMutation.isPending}
          onClick={handleSubmit}
          className="mt-8 h-14 w-full rounded-full text-[15px]"
        >
          {saveMutation.isPending ? "Creating…" : "Create wedding"}
          {!saveMutation.isPending && <ArrowRight size={16} />}
        </TextureButton>
      </div>
    </main>
  );
}

// Leading-icon + label row with an inline input filling the rest (Luma list style).
const FIELD_INPUT =
  "flex-1 bg-transparent text-base text-clay-ink outline-none placeholder:text-neutral-400";

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#346739]/10 text-[#346739]">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      {children}
    </label>
  );
}

function CoverCard({
  coupleName,
  eventDate,
  venueName,
  venueAddress,
}: {
  coupleName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
}) {
  const { dateLabel, countdown } = useMemo(() => formatDate(eventDate), [eventDate]);
  const venueLine = [venueName.trim(), venueAddress.trim()].filter(Boolean).join(" · ");

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-gradient-to-b from-emerald-300 to-emerald-600 shadow-[0_22px_50px_-22px_rgba(0,0,0,0.4)] ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={COVER_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
          The wedding of
        </span>
        <p className="mt-2 text-[26px] font-semibold leading-tight">
          {coupleName.trim() || "Your names"}
        </p>
        <div className="mx-auto mt-3 h-px w-10 bg-white/40" />
        <div className="mt-3 space-y-0.5 text-sm text-white/85">
          <p className="tabular-nums">{dateLabel}</p>
          {countdown && <p className="text-xs font-medium text-white">{countdown}</p>}
          {venueLine && <p className="pt-0.5 text-xs text-white/70">{venueLine}</p>}
        </div>
      </div>
    </div>
  );
}

// Wedding invitations used as the hero carousel on the welcome screen. Unsplash
// photos sit over a tinted gradient so the card still reads if an image fails.
type HeroCardData = {
  name: string;
  meta: string;
  img: string;
  tone: string;
  badge?: string;
};

const HERO_CARDS: HeroCardData[] = [
  {
    name: "Maya & Arjun",
    meta: "14 June · Bali",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80&auto=format&fit=crop",
    tone: "from-rose-300 to-rose-500",
  },
  {
    name: "Alya & Bima",
    meta: "20 September · Rimba Glass House",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=640&q=80&auto=format&fit=crop",
    tone: "from-emerald-300 to-emerald-600",
    badge: "Going",
  },
  {
    name: "Sari & Dimas",
    meta: "5 October · Yogyakarta",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80&auto=format&fit=crop",
    tone: "from-amber-300 to-amber-500",
  },
];

function WelcomeScreen({ reduceMotion, onStart }: { reduceMotion: boolean; onStart: () => void }) {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay } },
  });

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white text-clay-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14">
        {/* Brand (centered) */}
        <header className="flex justify-center">
          <BrandLogo />
        </header>

        {/* Hero card carousel */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex h-[300px] w-full items-center justify-center">
            <HeroCard card={HERO_CARDS[0]} reduceMotion={reduceMotion} delay={0.12}
              className="absolute right-1/2 z-0 mr-[84px] w-36 -rotate-3 opacity-55" />
            <HeroCard card={HERO_CARDS[2]} reduceMotion={reduceMotion} delay={0.12}
              className="absolute left-1/2 z-0 ml-[84px] w-36 rotate-3 opacity-55" />
            <HeroCard card={HERO_CARDS[1]} reduceMotion={reduceMotion} delay={0.04} featured
              className="relative z-10 w-52" />
          </div>
        </div>

        {/* Headline + subtitle */}
        <div className="space-y-3 text-center">
          <motion.h1 {...rise(0.18)} className="text-[34px] font-semibold leading-[1.08] tracking-tight text-clay-ink">
            Create your wedding invitation
          </motion.h1>
          <motion.p {...rise(0.24)} className="mx-auto max-w-[20rem] text-[15px] leading-6 text-neutral-500">
            Build a beautiful invite and share the celebration with everyone you love.
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div {...rise(0.3)} className="mt-8">
          <TextureButton
            type="button"
            variant="primary"
            onClick={onStart}
            className="h-14 w-full rounded-full text-[15px]"
          >
            Create your wedding
            <ArrowRight size={16} />
          </TextureButton>
        </motion.div>
      </div>
    </main>
  );
}

function HeroCard({
  card,
  className,
  reduceMotion,
  delay,
  featured = false,
}: {
  card: HeroCardData;
  className?: string;
  reduceMotion: boolean;
  delay: number;
  featured?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94, y: reduceMotion ? 0 : 10 }}
      animate={{
        opacity: className?.includes("opacity-55") ? 0.55 : 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", duration: 0.6, bounce: 0.18, delay },
      }}
      className={`aspect-[3/4.3] overflow-hidden rounded-[26px] bg-gradient-to-b ${card.tone} shadow-[0_22px_50px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5 ${className ?? ""}`}
    >
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {card.badge && featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#346739] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            <CheckCircle size={11} weight="Bold" />
            {card.badge}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
          <p className={`font-semibold leading-tight ${featured ? "text-lg" : "text-[13px]"}`}>{card.name}</p>
          <p className={`mt-0.5 text-white/80 ${featured ? "text-[11px]" : "text-[9px]"}`}>{card.meta}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Hosted Rimba wordmark (same asset as the site Header). The source webp is
// 5692×3200 with heavy transparent vertical padding, so -my-4 crops it down to
// sit tight in the onboarding header.
function BrandLogo() {
  return (
    <Image
      src="https://contents.rimba.app/assets/rimba-logo.webp"
      alt="Rimba"
      width={5692}
      height={3200}
      priority
      className="-my-4 block h-20 w-auto"
    />
  );
}

function CelebrationView({
  profile,
  reduceMotion,
  onEnter,
}: {
  profile: WeddingProfile | null;
  reduceMotion: boolean;
  onEnter: () => void;
}) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <motion.span
        initial={{ scale: reduceMotion ? 1 : 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: { type: "spring", duration: 0.5, bounce: 0.25, delay: 0.05 },
        }}
        className="grid size-16 place-items-center rounded-full bg-[#346739]/10 text-[#346739]"
      >
        <CheckCircle size={36} weight="Bold" />
      </motion.span>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-clay-ink">You&apos;re all set 🎉</h1>
        <p className="text-sm leading-6 text-neutral-500">
          {profile?.couple_name
            ? `${profile.couple_name}'s wedding is ready. Your dashboard is unlocked.`
            : "Your wedding is ready. Your dashboard is unlocked."}
        </p>
      </div>

      <TextureButton
        type="button"
        variant="primary"
        onClick={onEnter}
        className="h-12 w-full rounded-full text-sm"
      >
        Go to dashboard
        <ArrowRight size={16} />
      </TextureButton>
    </motion.div>
  );
}

function formatDate(value: string): { dateLabel: string; countdown: string | null } {
  if (!value) return { dateLabel: "Date to be set", countdown: null };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { dateLabel: "Date to be set", countdown: null };

  const dateLabel = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  const countdown =
    days > 0 ? `${days} ${days === 1 ? "day" : "days"} to go` : days === 0 ? "Today's the day" : null;

  return { dateLabel, countdown };
}

function OnboardingStatus({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-clay-ink">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      </div>
    </main>
  );
}
