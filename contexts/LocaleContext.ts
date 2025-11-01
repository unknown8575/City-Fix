
import { createContext } from 'react';

export interface ILocaleContext {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const defaultValue: ILocaleContext = {
    lang: 'en',
    setLang: () => {},
    t: (key: string) => key,
};

export const LocaleContext = createContext<ILocaleContext>(defaultValue);
