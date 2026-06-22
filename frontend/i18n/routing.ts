import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'id'],

  // Used when no locale matches
  defaultLocale: 'id',

  // Always resolve `/` to the default locale (`id`) rather than guessing from
  // the browser's Accept-Language header. Preserves the app's prior behavior
  // (the old manual `redirect("/id")`) and keeps the entrypoint deterministic.
  localeDetection: false
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
