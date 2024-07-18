/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { Button, Spinner, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

import EditComponent from '../../components/edit-component';
import ProfileItem from '../../components/profile-item';

import api from '../../libs/api';
import { DEFAULT_RESUME, MINIMUM_RESUME_TEMPLATE } from '../../libs/const';

import plusIcon from '../../assets/plus-lg.svg';

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
      const res = await api.post<ApiResponse<UserInfo>>('/api/profile/create', {
        profile: formData,
        wallet: walletAddress,
      });
      const { success, message, data } = res.data;
      setEditStatus(false);
      if (!success || !data) {
        toast.error(message || 'Failed to create profile');
        return;
      }
      setUserInfo(data);
      toast.success(message || 'Profile created successfully');
    } catch (error) {
      toast.error('An error occurred while creating profile');
    }
  };

  // Handle update of existing profile
  const handleUpdateProfile = async (formData: UserInfo) => {
    try {
      const res = await api.put<ApiResponse<void>>('/api/profile/update', {
        profile: formData,
        wallet: walletAddress,
      });
      const { success, message } = res.data;
      setEditStatus(false);
      if (!success) {
        toast.error(message || 'Failed to update profile');
        return;
      }
      toast.success(message || 'Profile updated successfully');
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
    console.log(updatedUserInfo);
    setUserInfo(updatedUserInfo);
    setEditStatus(false);
    // cache
    // if (updatedUserInfo._id) {
    //   handleUpdateProfile(updatedUserInfo);
    // } else {
    //   handleSubmit(updatedUserInfo);
    // }
  };

  const handleAddBasicInfo = () => {
    if (userInfo) {
      setUserInfo({
        ...userInfo,
        basicInfo: [...userInfo.basicInfo, ''],
      });
    }
  };

  const renderPlusItem = () => {
    if (!editStatus) return null;
    return (
      <div className="append-item" onClick={handleAddBasicInfo}>
        <img src={plusIcon} alt="plus" />
      </div>
    );
  };

  const handleSelectTemplate = (eventKey: string | null) => {
    const index = parseInt(eventKey ?? '0', 10);
    setSelectedTemplate(index);
  };

  const handleAddGroup = () => {
    if (selectedTemplate === null) {
      return;
    }

    setUserInfo((prevUserInfo) => {
      if (!prevUserInfo) {
        return null;
      }

      const newProfiles = [...prevUserInfo.profiles];

      switch (selectedTemplate) {
        case 0:
          newProfiles.push({
            title: '新建通用模板',
            descriptions: ['请在这里添加描述'],
          });
          break;
        case 1:
          newProfiles.push({
            title: '新建个人简介',
            summary: '请在这里添加个人简介',
          });
          break;
        case 2:
          newProfiles.push({
            title: '新建工作经历',
            list: [
              {
                title: '新工作经历项目',
                descriptions: ['请在这里添加工作描述'],
              },
            ],
          });
          break;
        default:
          return prevUserInfo;
      }

      return {
        ...prevUserInfo,
        profiles: newProfiles,
      };
    });

    setSelectedTemplate(0);
  };

  const renderPlusGroup = () => {
    if (!editStatus) return null;

    const titles = ['通用模版', '个人简介', '工作经历'];

    return (
      <div className="d-flex justify-content-end">
        <ButtonGroup>
          <Button onClick={handleAddGroup}>添加</Button>
          <DropdownButton
            as={ButtonGroup}
            onSelect={handleSelectTemplate}
            title={titles[selectedTemplate]}
            id="bg-nested-dropdown">
            {titles.map((title, index) => (
              <Dropdown.Item eventKey={index} key={title}>
                {title}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </ButtonGroup>
      </div>
    );
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
        <div className="d-flex align-items-center justify-content-between">
          <div className="header">
            <h1>
              <EditComponent status={editStatus} name="name">
                {userInfo.name}
              </EditComponent>
            </h1>
          </div>
          <div className="d-flex justify-content-between gap-3">
            {editStatus ? (
              <Button variant="light" className="small py-0" onClick={handleCancel}>
                取消
              </Button>
            ) : (
              <Link to="/">返回</Link>
            )}
            <Button
              variant="primary"
              className={classNames('small py-0', { 'btn btn-primary': editStatus })}
              onClick={() => (editStatus ? handleSave() : setEditStatus(true))}>
              {editStatus ? '保存' : '编辑'}
            </Button>
          </div>
        </div>
        <hr className="mb-3 mb-md-5" />
        <div className="d-flex flex-column flex-md-row gap-4 ">
          <div className="basicInfo">
            {userInfo.basicInfo.map((text, index) => (
              <p className="mb-3" key={`${text}-${index}`}>
                <EditComponent status={editStatus} name={`basicInfo[${index}]`}>
                  {text}
                </EditComponent>
              </p>
            ))}
            {renderPlusItem()}
            <hr />
          </div>
          <div className="profile flex-1">
            {userInfo.profiles.map((profile, index) => (
              <ProfileItem profile={profile} profileIndex={index} editStatus={editStatus} key={index} />
            ))}
            {renderPlusGroup()}
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResumePage;
