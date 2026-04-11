export const i18nConfig = {
  locales: ['en', 'fr', 'ar'],
  defaultLocale: 'en',
};

export type Locale = (typeof i18nConfig.locales)[number];
