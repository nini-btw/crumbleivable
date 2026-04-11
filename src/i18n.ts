import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { i18nConfig } from '../i18n.config';

export default getRequestConfig(async () => {
  // Get locale from header set by middleware
  const headersList = await headers();
  const locale = headersList.get('x-locale') || i18nConfig.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
