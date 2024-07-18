import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import blockletLogo from '../assets/blocklet.svg';
import plusIcon from '../assets/plus-lg.svg';

import { RESUME_TEMPLATE } from '../libs/const';
import api from '../libs/api';

import './home.css';

// Define the structure of API responses
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

type BasicInfo = string[];

interface ProfileItem {
  _id: string;
  name: string;
  basicInfo: BasicInfo;
}

type ProfileList = ProfileItem[];

function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [profileList, setProfileList] = useState<ProfileList | null>(null);

  // Fetch client wallet address as primary key
  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const res = await api.get<ApiResponse<string>>('/api/address/query');
        const { success, data } = res.data;
        if (!success || !data) {
          toast.error('Failed to obtain the current wallet address!');
          return;
        }
        setWalletAddress(data);
      } catch (error) {
        toast.error('An error occurred while fetching wallet address');
      }
    };
    fetchWalletAddress();
  }, []);

  useEffect(() => {
    const fetchProfileList = async (wallet: string) => {
      try {
        const res = await api.get<ApiResponse<ProfileList>>(`/api/profiles/query?wallet=${wallet}`);
        const { success, data } = res.data;
        if (success && data) {
          setProfileList(data);
        }
      } catch (error) {
        toast.error('An error occurred while fetching profile data');
      }
    };
    if (walletAddress) {
      fetchProfileList(walletAddress);
    }
  }, [walletAddress]);

  // render template profile
  const renderTemplateProfile = () => {
    if (profileList === null) return null;
    if (profileList.length) return null;
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

  return (
    <div className="home-page container px-3">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <h1>Resume manager</h1>
        <a href="https://www.arcblock.io/docs/blocklet-developer/getting-started" target="_blank" rel="noreferrer">
          <img src={blockletLogo} className="logo blocklet" alt="Blocklet logo" />
        </a>
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
