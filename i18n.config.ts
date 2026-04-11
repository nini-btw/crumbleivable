export const locales = ['en', 'fr', 'ar'] as const;
export const defaultLocale = 'en' as const;

export const i18nConfig = {
  locales,
  defaultLocale,
};

export type Locale = (typeof locales)[number];
