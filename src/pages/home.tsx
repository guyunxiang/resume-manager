import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { useAppContext } from '../components/app-context';
import PageLoading from '../components/page-loading';

import { RESUME_TEMPLATE } from '../libs/const';
import useApiGet from '../hooks/use-api-get';

import './home.css';
import plusIcon from '../assets/plus-lg.svg';

// Define the structure of a resume item
interface ResumeItem {
  _id: string;
  name: string;
  basicInfo: string[];
}

// Use function declaration for the component
function Home(): JSX.Element {
  const { t } = useLocaleContext();
  const { walletAddress, setWalletAddress } = useAppContext();

  // Use the custom hook to fetch wallet address
  const { data: fetchedWalletAddress, loading: addressLoading } = useApiGet<string>('/api/address/query');

  // Use the custom hook to fetch profile list
  const { data: profileList, loading: profileLoading } = useApiGet<ResumeItem[]>(
    walletAddress ? `/api/profiles/query?wallet=${walletAddress}` : null,
  );

  // Update wallet address when fetched
  useEffect(() => {
    if (fetchedWalletAddress) {
      setWalletAddress(fetchedWalletAddress);
    }
  }, [fetchedWalletAddress, setWalletAddress]);

  // Function to render template profile
  const renderTemplateProfile = () => {
    if (profileList === null || profileList.length > 0) return null;
    return (
      <li>
        <Link to="/profile/new?template=true">
          <h3 className="mb-3">{RESUME_TEMPLATE.name}</h3>
          <div className="d-flex flex-column gap-2">
            {RESUME_TEMPLATE.basicInfo.slice(0, 3).map((item) => (
              <p key={item} className="m-0">
                {item}
              </p>
            ))}
          </div>
        </Link>
      </li>
    );
  };

  // Show loading state if either address or profile is loading
  if (addressLoading || profileLoading) {
    return <PageLoading />;
  }

  return (
    <div className="home-page container px-3">
      <div className="header d-flex align-items-center justify-content-between gap-3">
        <h1>{t('appName')}</h1>
      </div>
      <hr className="mb-3 mb-md-5" />
      <div className="card">
        <ul className="resume-list">
          {profileList?.map(({ _id, name, basicInfo }) => (
            <li key={_id}>
              <Link to={`/profile/${_id}`}>
                <h3 className="mb-3">{name}</h3>
                <div className="d-flex flex-column gap-2">
                  {basicInfo.slice(0, 3).map((item) => (
                    <p key={item} className="m-0">
                      {item}
                    </p>
                  ))}
                </div>
              </Link>
            </li>
          ))}
          {renderTemplateProfile()}
          <li className="create_new">
            <Link to="/profile/new">
              <img src={plusIcon} alt="add" className="add" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
