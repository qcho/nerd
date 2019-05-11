import { useTranslation } from 'react-i18next';

export default function useRouteTitle(location: any) {
  const [t] = useTranslation();
  const pathname = location.pathname;
  if (pathname == '/') {
    return t('Named entity recognizer');
  }
  if (pathname == '/preview') {
    return t('NER preview');
  }
  if (pathname == '/admin/corpus') {
    return t('Corpus Management');
  }
  if (pathname == '/admin/users') {
    return t('User Management');
  }
  if (pathname == '/train') {
    return t('Train Corpus');
  }
  return '';
}
