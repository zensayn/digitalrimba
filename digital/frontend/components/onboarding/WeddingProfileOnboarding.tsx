"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  IconArrowRight,
  IconBeach,
  IconBuildingMonument,
  IconCalendarEvent,
  IconChevronLeft,
  IconCircleCheckFilled,
  IconGlassChampagne,
  IconLeaf,
  IconMapPin,
  IconSparkles,
  IconUsersGroup,
  type IconProps,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import { fetchWeddingProfile, saveWeddingProfile, type WeddingProfile } from "@/lib/api/weddings";
import { getWeddingProfileRedirectPath } from "@/lib/wedding-profile-routing";

// Strong ease-out curve (emil-design-eng) — built-in easings lack punch.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Cohere palette (matches fisik/frontend) — kept inline as fisik does.
const INK = "#212121";
const PRIMARY = "#346739";
const DEEP_GREEN = "#003c33";

type TablerIcon = React.ComponentType<IconProps>;

// The day's feeling. Each vibe owns its own photo + gradient fallback (rendered
// as a background-image so a failed load degrades cleanly to the gradient) and a
// Tabler icon reused on the final invitation reveal.
type Vibe = { id: string; Icon: TablerIcon; label: string; img: string; tone: string };
const VIBES: Vibe[] = [
  {
    id: "intimate",
    Icon: IconLeaf,
    label: "Intimate & natural",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80&auto=format&fit=crop",
    tone: "from-emerald-400 to-emerald-700",
  },
  {
    id: "grand",
    Icon: IconGlassChampagne,
    label: "Grand & glamorous",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop",
    tone: "from-amber-300 to-amber-600",
  },
  {
    id: "beach",
    Icon: IconBeach,
    label: "Beach & barefoot",
    img: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&q=80&auto=format&fit=crop",
    tone: "from-sky-300 to-cyan-600",
  },
  {
    id: "traditional",
    Icon: IconBuildingMonument,
    label: "Traditional & sacred",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80&auto=format&fit=crop",
    tone: "from-rose-300 to-rose-600",
  },
  {
    id: "modern",
    Icon: IconSparkles,
    label: "Modern & minimal",
    img: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80&auto=format&fit=crop",
    tone: "from-neutral-300 to-neutral-700",
  },
];
const GUEST_OPTIONS = ["Under 50", "50–150", "150–300", "300+"];

// One ordered walk through the flow. `input` steps move the progress bar;
// `moment` steps are zero-effort reflection beats that react to the last answer.
type StepKind = "input" | "moment";
type Step = { key: string; kind: StepKind };
const SEQUENCE: Step[] = [
  { key: "host", kind: "input" },
  { key: "meet", kind: "moment" },
  { key: "couple", kind: "input" },
  { key: "story", kind: "input" },
  { key: "storyReflect", kind: "moment" },
  { key: "vibe", kind: "input" },
  { key: "date", kind: "input" },
  { key: "countdown", kind: "moment" },
  { key: "guests", kind: "input" },
  { key: "venue", kind: "input" },
  { key: "address", kind: "input" },
];
const TOTAL_INPUT_STEPS = SEQUENCE.filter((s) => s.kind === "input").length;

export default function WeddingProfileOnboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion() ?? false;

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [hostName, setHostName] = useState("");
  // Two partner fields, joined into the single `couple_name` the API expects.
  const [partnerOne, setPartnerOne] = useState("");
  const [partnerTwo, setPartnerTwo] = useState("");
  const [story, setStory] = useState("");
  const [vibe, setVibe] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestEstimate, setGuestEstimate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<WeddingProfile | null>(null);

  const coupleName = useMemo(
    () => [partnerOne, partnerTwo].map((n) => n.trim()).filter(Boolean).join(" & "),
    [partnerOne, partnerTwo],
  );

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

  const step = SEQUENCE[index];
  const { days } = useMemo(() => formatDate(eventDate), [eventDate]);

  const goNext = useCallback(() => {
    setFormError(null);
    setIndex((i) => Math.min(i + 1, SEQUENCE.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setFormError(null);
    if (index === 0) {
      setStarted(false);
      return;
    }
    // Skip back over moment screens — they aren't somewhere you "go".
    let prev = index - 1;
    while (prev > 0 && SEQUENCE[prev].kind === "moment") prev -= 1;
    setIndex(prev);
  }, [index]);

  function submit() {
    if (!coupleName.trim()) {
      setFormError("Add at least one name to continue.");
      return;
    }
    setFormError(null);
    saveMutation.mutate({
      host_name: hostName.trim(),
      couple_name: coupleName.trim(),
      story: story.trim(),
      vibe: vibe,
      event_date: eventDate.trim(),
      guest_estimate: guestEstimate,
      venue_name: venueName.trim(),
      venue_address: venueAddress.trim(),
    });
  }

  // Moment screens auto-advance. Reflections with nothing to say (story/date
  // skipped) pass through instantly so the flow never stalls on an empty beat.
  useEffect(() => {
    if (step.kind !== "moment") return;
    // Reflections with nothing to react to (story/date skipped) pass through
    // instantly via a 0ms timeout — never a synchronous setState in the effect.
    const skip =
      (step.key === "storyReflect" && !story.trim()) ||
      (step.key === "countdown" && !eventDate.trim());
    const delay = skip ? 0 : reduceMotion ? 2600 : 2000;
    const t = setTimeout(goNext, delay);
    return () => clearTimeout(t);
  }, [step.kind, step.key, story, eventDate, reduceMotion, goNext]);

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

  // Welcome screen — fanned photo invitation cards (Apple Invites-style).
  if (!started) {
    return (
      <WelcomeScreen
        reduceMotion={reduceMotion}
        onStart={() => {
          setIndex(0);
          setStarted(true);
        }}
      />
    );
  }

  // Celebration — fresh save complete; the invitation artifact is revealed here.
  if (savedProfile) {
    return (
      <CelebrationView profile={savedProfile} reduceMotion={reduceMotion} onEnter={enterDashboard} />
    );
  }

  // Reflection moments — full-bleed, no chrome, their own composition.
  if (step.kind === "moment") {
    // Skipped reflections (no story/date) render nothing while the 0ms
    // auto-advance effect fires — no empty-beat flash.
    if (
      (step.key === "storyReflect" && !story.trim()) ||
      (step.key === "countdown" && !eventDate.trim())
    ) {
      return null;
    }
    return (
      <MomentScreen
        stepKey={step.key}
        hostName={hostName}
        story={story}
        days={days}
        reduceMotion={reduceMotion}
        onContinue={goNext}
      />
    );
  }

  // Progress reflects completed input steps only.
  const inputNumber = SEQUENCE.slice(0, index + 1).filter((s) => s.kind === "input").length;
  const progress = inputNumber / TOTAL_INPUT_STEPS;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-white" style={{ color: INK }}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-6 md:max-w-xl md:px-10">
        {/* Header: back chevron · brand · slim continuous progress */}
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="absolute left-0 grid size-9 place-items-center rounded-full text-[#93939f] transition-all duration-200 ease-out hover:bg-[#f4f2ee] hover:text-[#212121] active:scale-[0.94]"
          >
            <IconChevronLeft size={20} stroke={1.75} />
          </button>
          <BrandLogo />
        </header>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: PRIMARY }}
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE_OUT }}
          />
        </div>

        {/* The question — each step its own full composition, no shared preview box */}
        <div className="relative flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE_OUT }}
              className="flex flex-1 flex-col pt-8"
            >
              <StepBody
                step={step}
                hostName={hostName}
                setHostName={setHostName}
                partnerOne={partnerOne}
                setPartnerOne={setPartnerOne}
                partnerTwo={partnerTwo}
                setPartnerTwo={setPartnerTwo}
                story={story}
                setStory={setStory}
                vibe={vibe}
                setVibe={setVibe}
                eventDate={eventDate}
                setEventDate={setEventDate}
                guestEstimate={guestEstimate}
                setGuestEstimate={setGuestEstimate}
                venueName={venueName}
                setVenueName={setVenueName}
                venueAddress={venueAddress}
                setVenueAddress={setVenueAddress}
                days={days}
                onCommit={step.key === "address" ? submit : goNext}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {(formError || saveMutation.isError) && (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError ??
              (saveMutation.error instanceof Error ? saveMutation.error.message : "Unable to save wedding profile.")}
          </p>
        )}

        {/* Footer CTA — shared frame, label/state per step */}
        <Footer
          step={step}
          coupleName={coupleName}
          pending={saveMutation.isPending}
          onContinue={goNext}
          onSubmit={submit}
          onSkip={goNext}
        />
      </div>
    </main>
  );
}

// ── Per-step bodies ─────────────────────────────────────────────────────────
// Every screen is deliberately a different composition so the flow never reads
// as one template reskinned.

type StepBodyProps = {
  step: Step;
  hostName: string;
  setHostName: (v: string) => void;
  partnerOne: string;
  setPartnerOne: (v: string) => void;
  partnerTwo: string;
  setPartnerTwo: (v: string) => void;
  story: string;
  setStory: (v: string) => void;
  vibe: string;
  setVibe: (v: string) => void;
  eventDate: string;
  setEventDate: (v: string) => void;
  guestEstimate: string;
  setGuestEstimate: (v: string) => void;
  venueName: string;
  setVenueName: (v: string) => void;
  venueAddress: string;
  setVenueAddress: (v: string) => void;
  days: number | null;
  onCommit: () => void;
};

function StepBody(p: StepBodyProps) {
  switch (p.step.key) {
    case "host":
      // Conversational open — guide avatar + a single underlined line.
      return (
        <div className="flex flex-1 flex-col">
          <Guide>First — who are we planning with?</Guide>
          <p className="mt-2 text-sm leading-6 text-[#616161]">So we can make this yours.</p>
          <div className="mt-10">
            <input
              autoFocus
              value={p.hostName}
              onChange={(e) => p.setHostName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && p.onCommit()}
              placeholder="Your name"
              className="w-full border-b border-[#e5e7eb] bg-transparent pb-3 text-center text-2xl font-medium tracking-[-0.015em] text-[#212121] outline-none transition-colors placeholder:text-[#c4c4cc] focus:border-[#346739] md:text-3xl"
            />
          </div>
        </div>
      );

    case "couple": {
      // The centerpiece — oversized editorial names, no boxes. Two underlined
      // lines joined by a big ampersand.
      // Either partner enables Continue (coupleName joins whichever is set) —
      // Enter must match the footer's rule, not require partner one.
      const commit = () => (p.partnerOne.trim() || p.partnerTwo.trim()) && p.onCommit();
      return (
        <div className="flex flex-1 flex-col">
          <Headline>Who&apos;s getting married?</Headline>
          <Sub>This is the name your guests will fall in love with.</Sub>
          <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-5">
            <input
              autoFocus
              value={p.partnerOne}
              onChange={(e) => p.setPartnerOne(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="Partner one"
              aria-label="Partner one"
              className="w-full max-w-xs border-b border-[#e5e7eb] bg-transparent pb-2 text-center text-3xl font-medium tracking-[-0.02em] text-[#212121] outline-none transition-colors placeholder:text-[#d4d4dc] focus:border-[#346739] md:text-4xl"
            />
            <span className="text-2xl font-medium text-[#93939f]">&amp;</span>
            <input
              value={p.partnerTwo}
              onChange={(e) => p.setPartnerTwo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="Partner two"
              aria-label="Partner two"
              className="w-full max-w-xs border-b border-[#e5e7eb] bg-transparent pb-2 text-center text-3xl font-medium tracking-[-0.02em] text-[#212121] outline-none transition-colors placeholder:text-[#d4d4dc] focus:border-[#346739] md:text-4xl"
            />
          </div>
        </div>
      );
    }

    case "story":
      // Journal layout — writing inside a framed quote card, not a plain field.
      return (
        <div>
          <Headline>How did you two meet?</Headline>
          <Sub>A line or two — we&apos;ll weave it into your invitation. Skip if you&apos;d rather not.</Sub>
          <div className="mt-6 rounded-[24px] border border-[#e5e7eb] bg-[#fafafa] p-6">
            <span aria-hidden className="block font-serif text-5xl leading-none text-[#346739]/30">
              &ldquo;
            </span>
            <textarea
              autoFocus
              value={p.story}
              onChange={(e) => p.setStory(e.target.value)}
              rows={4}
              placeholder="It started with…"
              className="mt-1 w-full resize-none bg-transparent text-lg leading-relaxed text-[#212121] outline-none placeholder:text-[#93939f]"
            />
          </div>
        </div>
      );

    case "vibe":
      // Full-bleed photo tiles — the most visual screen.
      return (
        <div>
          <Headline>What&apos;s the feeling of your day?</Headline>
          <Sub>We&apos;ll shape your invitation around it.</Sub>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {VIBES.map((v) => {
              const active = p.vibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => p.setVibe(active ? "" : v.id)}
                  className={`group relative aspect-[3/4] overflow-hidden rounded-[18px] bg-gradient-to-b ${v.tone} text-left transition-all duration-200 ease-out active:scale-[0.98] ${
                    active ? "ring-2 ring-[#346739] ring-offset-2" : "ring-1 ring-black/5"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${v.img})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  {active && (
                    <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white text-[#346739] shadow-sm">
                      <IconCircleCheckFilled size={20} />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-3.5 text-[15px] font-medium leading-snug text-white">
                    {v.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case "date":
      // Centered single focus — big date control + a large live countdown.
      return (
        <div className="flex flex-1 flex-col">
          <Headline>When&apos;s the big day?</Headline>
          <Sub>We&apos;ll count down the days with you and your guests.</Sub>
          <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-3 rounded-full border border-[#e5e7eb] bg-white px-6 py-4">
              <span className="text-[#346739]">
                <IconCalendarEvent size={20} stroke={1.75} />
              </span>
              <input
                type="date"
                value={p.eventDate}
                onChange={(e) => p.setEventDate(e.target.value)}
                className="bg-transparent text-center text-lg text-[#212121] outline-none"
              />
            </div>
            <AnimatePresence>
              {p.days !== null && p.days >= 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="text-center"
                >
                  <p className="text-[64px] font-medium leading-none tracking-[-0.02em] text-[#346739] md:text-[80px]">
                    {p.days}
                  </p>
                  <p className="mt-1 text-sm text-[#616161]">{p.days === 1 ? "day" : "days"} to go</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );

    case "guests":
      // Vertical option rows with an icon each — different shape from the grid.
      return (
        <div>
          <Headline>How many people are you celebrating with?</Headline>
          <Sub>Just an estimate — you can invite them later.</Sub>
          <div className="mt-6 space-y-2.5">
            {GUEST_OPTIONS.map((g) => {
              const active = p.guestEstimate === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => p.setGuestEstimate(active ? "" : g)}
                  className={`flex w-full items-center gap-3 rounded-[14px] border px-4 py-3.5 text-left transition-all duration-200 ease-out active:scale-[0.99] ${
                    active
                      ? "border-[#346739] bg-[#edfce9]"
                      : "border-[#e5e7eb] bg-white hover:border-[#d9d9dd]"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${
                      active ? "bg-[#346739] text-white" : "bg-[#edfce9] text-[#346739]"
                    }`}
                  >
                    <IconUsersGroup size={18} stroke={1.75} />
                  </span>
                  <span className="flex-1 text-base font-medium text-[#212121]">{g} guests</span>
                  {active && (
                    <span className="text-[#346739]">
                      <IconCircleCheckFilled size={20} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "venue":
      // A located moment — large pin in a framed card with a centered name field.
      return (
        <div>
          <Headline>Where&apos;s it all happening?</Headline>
          <Sub>Guests get the place — and a map — automatically.</Sub>
          <div className="mt-6 flex flex-col items-center rounded-[24px] border border-[#e5e7eb] bg-[#fafafa] px-6 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#edfce9] text-[#346739]">
              <IconMapPin size={26} stroke={1.75} />
            </span>
            <input
              autoFocus
              value={p.venueName}
              onChange={(e) => p.setVenueName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && p.onCommit()}
              placeholder="Rimba Glass House"
              className="mt-5 w-full max-w-xs border-b border-[#e5e7eb] bg-transparent pb-2 text-center text-xl font-medium text-[#212121] outline-none transition-colors placeholder:text-[#c4c4cc] focus:border-[#346739]"
            />
          </div>
        </div>
      );

    case "address":
      // Multi-line address — a distinct field shape from the venue name.
      return (
        <div>
          <Headline>What&apos;s the address?</Headline>
          <Sub>So no one gets lost on the way to celebrate you.</Sub>
          <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-4">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#edfce9] text-[#346739]">
              <IconMapPin size={18} stroke={1.75} />
            </span>
            <textarea
              autoFocus
              value={p.venueAddress}
              onChange={(e) => p.setVenueAddress(e.target.value)}
              rows={3}
              placeholder="Street, district, city…"
              className="flex-1 resize-none bg-transparent text-base leading-relaxed text-[#212121] outline-none placeholder:text-[#93939f]"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ── Footer ──────────────────────────────────────────────────────────────────

function Footer({
  step,
  coupleName,
  pending,
  onContinue,
  onSubmit,
  onSkip,
}: {
  step: Step;
  coupleName: string;
  pending: boolean;
  onContinue: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const isAddress = step.key === "address";
  const skippable = step.key === "story" || step.key === "venue";
  const disabled =
    (step.key === "couple" && !coupleName.trim()) || (isAddress && pending);

  return (
    <div className="mt-8 space-y-3">
      <TextureButton
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={isAddress ? onSubmit : onContinue}
        className="h-14 w-full rounded-full text-[15px] disabled:opacity-50"
      >
        {isAddress ? (pending ? "Creating…" : "Create our invitation") : "Continue"}
        {!pending && <IconArrowRight size={16} stroke={2} />}
      </TextureButton>
      {skippable && (
        <button
          type="button"
          onClick={onSkip}
          className="block w-full py-1 text-center text-sm text-[#93939f] transition-colors hover:text-[#616161]"
        >
          {step.key === "venue" ? "No venue yet — add it later" : "Skip for now"}
        </button>
      )}
    </div>
  );
}

// ── Reflection moments ──────────────────────────────────────────────────────

function MomentScreen({
  stepKey,
  hostName,
  story,
  days,
  reduceMotion,
  onContinue,
}: {
  stepKey: string;
  hostName: string;
  story: string;
  days: number | null;
  reduceMotion: boolean;
  onContinue: () => void;
}) {
  const fade = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.5, ease: EASE_OUT },
  };

  return (
    <main
      onClick={onContinue}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onContinue();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Continue"
      className="flex min-h-[100dvh] cursor-pointer flex-col items-center justify-center bg-white px-8 text-center"
      style={{ color: INK }}
    >
      <div className="w-full max-w-md md:max-w-lg">
        {stepKey === "meet" && (
          <motion.div {...fade}>
            <GuideAvatar large />
            <h1 className="mt-6 text-3xl font-medium tracking-[-0.015em] md:text-4xl">
              Lovely to meet you{hostName.trim() ? `, ${hostName.trim()}` : ""}.
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-base text-[#616161]">
              Let&apos;s bring your big day to life.
            </p>
          </motion.div>
        )}

        {stepKey === "storyReflect" && (
          <motion.div {...fade}>
            <blockquote className="mx-auto max-w-sm text-xl italic leading-relaxed text-[#616161]">
              “{story.trim()}”
            </blockquote>
            <p className="mt-6 text-lg font-medium tracking-[-0.015em]">
              Every great wedding starts with a story like that.
            </p>
          </motion.div>
        )}

        {stepKey === "countdown" && (
          <motion.div {...fade}>
            <motion.div
              initial={{ scale: reduceMotion ? 1 : 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.2, delay: 0.05 }}
              className="text-[88px] font-medium leading-none tracking-[-0.02em] text-[#346739] md:text-[110px]"
            >
              {days ?? 0}
            </motion.div>
            <p className="mt-2 text-lg font-medium tracking-[-0.015em]">
              {days === 1 ? "day" : "days"} to go
            </p>
            <p className="mt-3 text-sm text-[#616161]">We&apos;ll make every one of them count.</p>
          </motion.div>
        )}

        <p className="mt-10 text-xs uppercase tracking-[0.18em] text-[#c4c4cc]">Tap to continue</p>
      </div>
    </main>
  );
}

// ── Shared pieces ───────────────────────────────────────────────────────────

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-medium leading-tight tracking-[-0.015em] text-[#212121] md:text-[32px]">
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm leading-6 text-[#616161] md:text-base">{children}</p>;
}

// Conversational headline paired with the guide avatar.
function Guide({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <GuideAvatar />
      <h1 className="pt-1 text-2xl font-medium leading-tight tracking-[-0.015em] text-[#212121] md:text-[30px]">
        {children}
      </h1>
    </div>
  );
}

// The friendly guide — an emerald sprig (Rimba = forest), in a pale-green tile.
function GuideAvatar({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`mx-auto grid shrink-0 place-items-center rounded-full bg-[#edfce9] text-[#346739] ${
        large ? "size-16" : "size-10"
      }`}
    >
      <IconLeaf size={large ? 30 : 20} stroke={1.75} />
    </span>
  );
}

// The invitation artifact — purely typographic, deep enterprise green. Revealed
// once on the celebration screen (no longer pinned to every step).
function InvitationCard({
  coupleName,
  meta,
  countdown,
  venueLine,
  VibeIcon,
}: {
  coupleName: string;
  meta?: string;
  countdown?: string | null;
  venueLine?: string;
  VibeIcon?: TablerIcon;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_18px_40px_-22px_rgba(0,60,51,0.55)]"
      style={{ backgroundColor: DEEP_GREEN }}
    >
      {/* Media-led radial glow (Cohere: gradients only as media, never UI fill) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 70% at 90% 0%, rgba(52,103,57,0.55), transparent 60%)",
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center text-white">
        {VibeIcon && (
          <span className="mb-4 grid size-9 place-items-center rounded-full bg-white/10 text-white/90">
            <VibeIcon size={18} stroke={1.75} />
          </span>
        )}
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
          The wedding of
        </span>
        <p className="mt-2 text-[26px] font-medium leading-tight">{coupleName || "Your names"}</p>
        <div className="mx-auto mt-3 h-px w-10 bg-white/30" />
        <div className="mt-3 space-y-0.5 text-white/80">
          {meta && <p className="text-sm tabular-nums">{meta}</p>}
          {countdown && <p className="text-xs font-medium text-white">{countdown}</p>}
          {venueLine && <p className="pt-0.5 text-xs text-white/60">{venueLine}</p>}
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
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white" style={{ color: INK }}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14 md:max-w-xl">
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
          <motion.h1 {...rise(0.18)} className="text-[34px] font-medium leading-[1.08] tracking-[-0.02em] text-[#212121]">
            Let&apos;s make an invitation they&apos;ll never forget.
          </motion.h1>
          <motion.p {...rise(0.24)} className="mx-auto max-w-[20rem] text-[15px] leading-6 text-[#616161]">
            Build something beautiful and share the day with everyone you love.
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
            Start with your names
            <IconArrowRight size={16} stroke={2} />
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
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#346739] px-2.5 py-1 text-[10px] font-medium text-white shadow-sm">
            <IconCircleCheckFilled size={11} />
            {card.badge}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
          <p className={`font-medium leading-tight ${featured ? "text-lg" : "text-[13px]"}`}>{card.name}</p>
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
  const { dateLabel, countdown } = formatDate(profile?.event_date ?? "");
  const vibeIcon = VIBES.find((v) => v.id === profile?.vibe)?.Icon;
  const venueLine = [profile?.venue_name?.trim(), profile?.venue_address?.trim()]
    .filter(Boolean)
    .join(" · ");
  return (
    <main className="flex min-h-[100dvh] flex-col bg-white" style={{ color: INK }}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10 pt-14 md:max-w-xl md:px-10">
        <motion.div
          key="done"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-medium tracking-[-0.015em] text-[#212121] md:text-[28px]">
              Your invitation is looking beautiful.
            </h1>
            <p className="text-sm leading-6 text-[#616161]">
              {countdown ? `${countdown}. ` : ""}Here&apos;s the artifact you just made.
            </p>
          </div>

          {/* The reveal — the invitation appears once, here. */}
          <motion.div
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92, y: reduceMotion ? 0 : 12 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", duration: 0.6, bounce: 0.2, delay: 0.1 },
            }}
            className="aspect-[4/3] w-full max-w-sm"
          >
            <InvitationCard
              coupleName={profile?.couple_name ?? ""}
              meta={dateLabel}
              countdown={countdown}
              venueLine={venueLine}
              VibeIcon={vibeIcon}
            />
          </motion.div>

          <TextureButton
            type="button"
            variant="primary"
            onClick={onEnter}
            className="h-12 w-full rounded-full text-sm"
          >
            Go to dashboard
            <IconArrowRight size={16} stroke={2} />
          </TextureButton>
        </motion.div>
      </div>
    </main>
  );
}

function formatDate(value: string): { dateLabel: string; countdown: string | null; days: number | null } {
  if (!value) return { dateLabel: "Date to be set", countdown: null, days: null };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { dateLabel: "Date to be set", countdown: null, days: null };

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

  return { dateLabel, countdown, days };
}

function OnboardingStatus({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_30px_-10px_rgba(33,33,33,0.08)]">
        <h1 className="text-xl font-medium tracking-[-0.015em] text-[#212121]">{title}</h1>
        <p className="mt-2 text-sm text-[#616161]">{description}</p>
      </div>
    </main>
  );
}
