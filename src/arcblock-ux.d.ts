declare module '@arcblock/ux/lib/Locale/context' {
  import { ReactNode, Context } from 'react';

  export interface Language {
    code: string;
    name: string;
  }

  export interface LocaleContextType {
    locale: string;
    changeLocale: (newLocale: string) => void;
    t: (key: string, data?: object) => string;
    languages: Language[];
    [key: string]: any;
  }

  export const LocaleContext: Context<LocaleContextType>;

  export interface LocaleProviderProps {
    children: ReactNode;
    translations: {
      [key: string]: object | (() => Promise<object>);
    };
    onLoadingTranslation?: (locale: string, languages: Language[]) => void;
    locale?: string;
    fallbackLocale?: string;
    languages?: Language[];
    [key: string]: any;
  }

  export function LocaleProvider(props: LocaleProviderProps): JSX.Element;

  export function useLocaleContext(): LocaleContextType;

  export function setLocale(locale: string): void;

  export function getLocale(languages?: Language[]): string;
}

declare module '@arcblock/ux/lib/Locale' {
  export * from '@arcblock/ux/lib/Locale/context';

  export interface LocaleSelectorProps {
    value: string;
    onChange: (locale: string) => void;
    locales: Array<{ name: string; value: string }>;
  }
  export function LocaleSelector(props: LocaleSelectorProps): JSX.Element;
}
