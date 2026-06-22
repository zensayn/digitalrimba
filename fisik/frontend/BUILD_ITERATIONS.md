# Build Iterations

## 2026-05-14

- Failed file: `components/template/apple/ui/AppleButton.tsx`
- TypeScript error: `React.ButtonHTMLAttributes<HTMLButtonElement>` forwarded to `motion.button` made `onDrag` incompatible with Motion's drag handler signature.
- Fix: changed `AppleButtonProps` to extend `React.ComponentPropsWithoutRef<typeof motion.button>` so forwarded props match `motion.button`.

- Failed file: `proxy.ts` / `middleware.ts`
- Build error: Next.js detected both `./middleware.ts` and `./proxy.ts` and stopped with `Please use "./proxy.ts" only.`
- Fix: removed legacy `proxy.ts` so the required `middleware.ts` is the single Clerk middleware entry.
