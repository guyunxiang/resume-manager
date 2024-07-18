/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { Button, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

import EditComponent from '../../components/edit-component';
import ProfileItem from '../../components/profile-item';

import api from '../../libs/api';
import { DEFAULT_RESUME, MINIMUM_RESUME_TEMPLATE } from '../../libs/const';

import './index.css';

// Define the structure of user information
interface UserInfo {
  _id?: string;
  name: string;
  basicInfo: string[];
  profiles: Array<{
    title: string;
    summary?: string;
    descriptions?: string[];
    list?: Array<{
      title: string;
      descriptions: string[];
    }>;
  }>;
}

// Define the structure of API responses
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function ResumePage(): React.ReactElement {
  const { pathname } = useLocation();
  const newProfile = pathname === '/profile/new';

  const formRef = useRef<HTMLFormElement>(null);

  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [originalUserInfo, setOriginalUserInfo] = useState<UserInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

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

  // Fetch profile data by wallet address
  useEffect(() => {
    const fetchProfileByWallet = async (wallet: string) => {
      try {
        const res = await api.get<ApiResponse<UserInfo>>(`/api/profile/query?wallet=${wallet}`);
        const { success, data } = res.data;
        if (success && data) {
          setUserInfo(data);
        } else {
          // Load local data if API call fails
          setUserInfo(DEFAULT_RESUME);
        }
      } catch (error) {
        toast.error('An error occurred while fetching profile data');
      }
    };
    if (walletAddress && !newProfile) {
      fetchProfileByWallet(walletAddress);
    }
    if (newProfile) {
      setUserInfo(MINIMUM_RESUME_TEMPLATE);
    }
  }, [walletAddress, newProfile]);

  // Save original user info when entering edit mode
  useEffect(() => {
    if (editStatus && userInfo) {
      setOriginalUserInfo(JSON.parse(JSON.stringify(userInfo)));
    }
  }, [editStatus, userInfo]);

  // Handle cancellation of edit mode
  const handleCancel = () => {
    if (originalUserInfo) {
      setUserInfo(originalUserInfo);
    }
    setEditStatus(false);
    setOriginalUserInfo(null);
  };

  // Handle submission of new profile
  const handleSubmit = async (formData: UserInfo) => {
    try {
      // const res = await api.post<ApiResponse<UserInfo>>('/api/profile/create', {
      //   profile: formData,
      //   wallet: walletAddress,
      // });
      // const { success, message, data } = res.data;
      // if (!success || !data) {
      //   toast.error(message || 'Failed to create profile');
      //   return;
      // }
      setEditStatus(false);
      setUserInfo(formData); // temp code
      // setUserInfo(data);
      // toast.success(message || 'Profile created successfully');
    } catch (error) {
      toast.error('An error occurred while creating profile');
    }
  };

  // Handle update of existing profile
  const handleUpdateProfile = async (formData: UserInfo) => {
    try {
      // const res = await api.put<ApiResponse<void>>('/api/profile/update', {
      //   profile: formData,
      //   wallet: walletAddress,
      // });
      // const { success, message } = res.data;
      // if (!success) {
      //   toast.error(message || 'Failed to update profile');
      //   return;
      // }
      // toast.success(message || 'Profile updated successfully');
      setEditStatus(false);
      setUserInfo(formData);
    } catch (error) {
      toast.error('An error occurred while updating profile');
    }
  };

  // Handle save action
  const handleSave = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const updatedUserInfo = { ...userInfo } as UserInfo;

    for (const [name, value] of formData.entries()) {
      const keys = name.replace(/\[(\w+)\]/g, '.$1').split('.');
      let current: any = updatedUserInfo;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) {
          if (!(key in current)) {
            current[key] = {};
          }
          current = current[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value.toString();
      }
    }
    // console.log(updatedUserInfo);
    // setUserInfo(updatedUserInfo);
    // setEditStatus(false);
    if (updatedUserInfo._id) {
      handleUpdateProfile(updatedUserInfo);
    } else {
      handleSubmit(updatedUserInfo);
    }
  };

  const handleAppend = (path: string) => {
    setUserInfo((prevUserInfo) => {
      if (!prevUserInfo) return null;

      const newUserInfo = JSON.parse(JSON.stringify(prevUserInfo));
      const keys = path.split('.');
      let current: any = newUserInfo;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key && key.includes('[')) {
          const parts = key.split('[');
          const arrayName = parts[0];
          const indexStr = parts[1];
          if (arrayName && indexStr) {
            const index = parseInt(indexStr.replace(']', ''), 10);
            if (!Number.isNaN(index)) {
              current = current[arrayName][index];
            } else {
              return prevUserInfo;
            }
          } else {
            return prevUserInfo;
          }
        } else if (key) {
          current = current[key];
        } else {
          return prevUserInfo;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey && Array.isArray(current[lastKey as keyof typeof current])) {
        switch (lastKey) {
          case 'basicInfo':
          case 'descriptions':
            (current[lastKey] as string[]).push('添加描述内容');
            break;
          case 'list':
            (current[lastKey] as Array<{ title: string; descriptions: string[] }>).push({
              title: '添加标题',
              descriptions: ['添加描述内容'],
            });
            break;
          default:
            console.warn(`Unhandled array type: ${lastKey}`);
        }
      }
      return newUserInfo;
    });
  };

  // loading
  if (!userInfo) {
    return (
      <div className="loading-content">
        <div className="d-flex align-items-center gap-3">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  return (
    <div className="resume-page container px-3">
      <form ref={formRef}>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="header">
            <h1>
              <EditComponent status={editStatus} name="name" append={false}>
                {userInfo.name}
              </EditComponent>
            </h1>
          </div>
          <div className="d-flex justify-content-between gap-3">
            {editStatus ? (
              <Button variant="light" className="small py-0" onClick={handleCancel}>
                Cancel
              </Button>
            ) : (
              <Link to="/">Back</Link>
            )}
            <Button
              variant="primary"
              className={classNames('small py-0', { 'btn btn-primary': editStatus })}
              onClick={() => (editStatus ? handleSave() : setEditStatus(true))}>
              {editStatus ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>
        <hr className="mb-3 mb-md-5" />
        <div className="d-flex flex-column flex-md-row gap-4 ">
          <div className="basicInfo">
            {userInfo.basicInfo.map((text, index) => (
              <p className="mb-3" key={`${text}-${index}`}>
                <EditComponent
                  status={editStatus}
                  name={`basicInfo[${index}]`}
                  onAppend={() => handleAppend('basicInfo')}>
                  {text}
                </EditComponent>
              </p>
            ))}
            <hr />
          </div>
          <div className="profile flex-1">
            {userInfo.profiles.map((profile, index) => (
              <ProfileItem
                key={index}
                profile={profile}
                profileIndex={index}
                editStatus={editStatus}
                onAppend={handleAppend}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResumePage;
