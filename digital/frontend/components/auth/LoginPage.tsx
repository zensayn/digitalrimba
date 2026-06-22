"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Earth, AltArrowDown, AltArrowLeft, AltArrowRight, Eye, EyeClosed } from '@solar-icons/react';
import { authClient } from '@/lib/auth-client';
import { motion } from 'motion/react';
import { TextureButton } from '@/components/ui/texture-button';
import { Input } from '@/components/ui/input';
import Carousel from '@/components/Carousel';

/* ── Feature cards ─────────────────────────────────────────── */
const carouselItems = [
  {
    id: 1,
    title: 'Design unforgettable invitations',
    description: 'Create premium digital invites with our editorial-grade builder.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#003c33] rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
        <div className="text-center">
          <p className="text-[10px] text-white/30 font-poppins tracking-[0.3em] uppercase mb-1">Preview</p>
          <div className="h-0.5 w-12 bg-[#346739] mx-auto rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Track every guest effortlessly',
    description: 'Real-time RSVP tracking and automated guest list management.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#edfce9] rounded-xl flex items-center justify-center border border-[#346739]/10">
        <div className="flex gap-2 items-end">
          <div className="w-3 h-8 bg-[#346739]/20 rounded-full" />
          <div className="w-3 h-12 bg-[#346739] rounded-full" />
          <div className="w-3 h-6 bg-[#346739]/10 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'The center for your moments',
    description: 'Collect memories and manage your budget in one beautiful space.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#f1f5ff] rounded-xl flex items-center justify-center border border-blue-500/10">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin-slow" />
      </div>
    ),
  },
];

/* ── Shared styles (Cohere Design System) ── */
const labelCls = 'text-[#212121] text-[14px] font-regular font-poppins mb-2 ml-6';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────── */
type LoginPageProps = { mode?: 'sign-in' | 'sign-up' };

export default function LoginPage({ mode: initialMode = 'sign-in' }: LoginPageProps) {
  const locale = useLocale();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = authMode === 'sign-up';

  const handleToggleMode = () => {
    const newMode = isSignUp ? 'sign-in' : 'sign-up';
    setAuthMode(newMode);
    // Update URL without full page reload to keep Carousel mounted
    const newUrl = newMode === 'sign-up' ? `/${locale}/sign-up` : `/${locale}/auth`;
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) { setAuthError(error.message ?? 'Sign-up failed.'); return; }
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) { setAuthError(error.message ?? 'Sign-in failed.'); return; }
      }
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        duration: 0.6,
        bounce: 0.2,
      },
    },
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#24212d] font-poppins overflow-hidden">
      {/* ── LEFT: branding panel with Carousel ── */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#24212d] relative overflow-hidden h-full">
        {/* Carousel — centered focus */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-visible">
          <div style={{ width: '620px' }} className="relative ml-8">
            <Carousel
              items={carouselItems}
              baseWidth={620}
              autoplay={true}
              autoplayDelay={5000}
              loop={true}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT: login panel with elevation ── */}
      <div className="flex-1 flex flex-col h-full bg-white lg:rounded-l-[64px] shadow-[-60px_0_90px_-20px_rgba(0,0,0,0.3)] relative z-20 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <TextureButton
            variant="secondary"
            className="rounded-full"
          >
            <Earth size={18} className="text-[#75758a]" />
            <span className="text-[13px] font-semibold">English</span>
            <AltArrowDown size={14} className="text-[#75758a]" />
          </TextureButton>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#75758a] font-medium hidden sm:inline">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <TextureButton
              variant="secondary"
              onClick={handleToggleMode}
              className="rounded-full text-[13px] font-bold"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </TextureButton>
          </div>
        </div>

        {/* Main form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto w-full py-12"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 w-full">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-[14px] bg-[#346739] flex items-center justify-center shadow-lg shadow-[#346739]/20">
                <div className="w-5 h-5 rounded-sm bg-white" />
              </div>
              <span className="text-3xl font-bold tracking-tighter text-[#000000] uppercase">Rimba</span>
            </div>
            <p className="text-2xl font-semibold text-[#000000] tracking-tight leading-tight mb-3">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
            <p className="text-[15px] font-medium text-[#75758a] max-w-[340px] mx-auto">
              {isSignUp ? 'Plan your dream wedding with precision.' : 'Design your most beautiful day, beautifully.'}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full space-y-0">
            {!showEmailForm ? (
              <>
                {/* Google OAuth - Initial state only */}
                <TextureButton
                  variant="secondary"
                  onClick={handleGoogleSignIn}
                  className="w-full h-[54px] rounded-full"
                >
                  <GoogleIcon />
                  {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
                </TextureButton>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-[#e5e5e5]" />
                    <span className="text-[#93939f] text-[10px] font-bold uppercase tracking-[0.25em]">or</span>
                    <div className="flex-1 h-px bg-[#e5e5e5]" />
                  </div>
                  <TextureButton
                    variant="secondary"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full h-[54px] rounded-full"
                  >
                    {isSignUp ? 'Sign up with email' : 'Login using email'}
                  </TextureButton>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-visible"
              >
                {/* Email / Password form */}
                <div className="mb-6 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="group flex items-center gap-1 text-[#75758a] hover:text-[#000000] transition-colors"
                  >
                    <AltArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                    <div className="relative">
                      <span className="text-[14px] font-regular">Back</span>
                      <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#346739] transition-all duration-300 group-hover:w-full" />
                    </div>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className={labelCls}>Email address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="h-[54px] rounded-[24px] px-6 ring-1 ring-foreground/10 focus:border-[#346739] focus:ring-[#346739]/5"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative group/pass">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="h-[54px] rounded-[24px] px-6 pr-14 ring-1 ring-foreground/10 focus:border-[#346739] focus:ring-[#346739]/5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#212121] transition-all active:scale-[0.95]"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-[#b30000] text-[13px] ml-6 font-medium">{authError}</p>
                  )}

                  <TextureButton
                    type="submit"
                    disabled={loading}
                    className="w-full h-[54px] rounded-full mt-4"
                    variant="primary"
                  >
                    {loading
                      ? (isSignUp ? 'Creating account…' : 'Signing in…')
                      : (isSignUp ? 'Create account' : 'Sign in')}
                  </TextureButton>
                </form>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <div className="pb-12 text-center">
          <p className="text-[12px] text-[#93939f] font-semibold">
            © {new Date().getFullYear()} Rimba Digital · Indonesia
          </p>
        </div>
      </div>
    </div>
  );
}
