
import { useContext } from 'react';
import { LocaleContext } from '../contexts/LocaleContext';

export const useLocalization = () => {
  return useContext(LocaleContext);
};
