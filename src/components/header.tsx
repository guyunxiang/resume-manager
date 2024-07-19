import Header from '@blocklet/ui-react/lib/Header';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
// @ts-ignore
import { Avatar, Address } from '@arcblock/did-connect/lib';

import { useAppContext } from './app-context';

interface LanguageTexts {
  en: string;
  zh: string;
}

interface NavigationItem {
  link: string;
  title: LanguageTexts;
}

interface Meta {
  navigation: NavigationItem[];
}

const meta: Meta = {
  navigation: [
    {
      link: '/',
      title: {
        en: 'Home',
        zh: '首页',
      },
    },
    {
      link: '/profile/new',
      title: {
        en: 'New Profile',
        zh: '新建简历',
      },
    },
  ],
};

function HeaderComponent() {
  const { previewMode, walletAddress } = useAppContext();

  const { t } = useLocaleContext();

  if (previewMode) return null;

  return (
    <Header
      meta={meta}
      brand={t('appName')}
      description={
        walletAddress ? (
          <Address prepend={<Avatar did={walletAddress} size={20} style={{ marginRight: 8 }} />} size={12}>
            {walletAddress}
          </Address>
        ) : null
      }
    />
  );
}

export default HeaderComponent;
