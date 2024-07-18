/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { debounce } from 'lodash';
import classNames from 'classnames';

import EditComponent from '../../components/edit-component';
import ProfileItem from '../../components/profile-item';

import api from '../../libs/api';
import { RESUME_TEMPLATE, MINIMUM_RESUME_TEMPLATE } from '../../libs/const';

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
  const navigate = useNavigate();

  const { pathname } = useLocation();
  // validate if on create profile page
  const isNewPage = pathname === '/profile/new';
  // get profile id from url
  const { id } = useParams();
  // get isTemplate, if true, display template profile
  const [searchParams] = useSearchParams();
  const isTemplate = searchParams.get('template') === 'true';

  const formRef = useRef<HTMLFormElement>(null);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [originalUserInfo, setOriginalUserInfo] = useState<UserInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

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
    const fetchProfileByIdAndWallet = async (wallet: string) => {
      try {
        const res = await api.get<ApiResponse<UserInfo>>(`/api/profile/query?wallet=${wallet}&id=${id}`);
        const { success, data } = res.data;
        if (!success || !data) {
          toast.error('Failed to obtain the current profile!');
          setUserInfo(MINIMUM_RESUME_TEMPLATE);
          return;
        }
        setUserInfo(data);
      } catch (error) {
        toast.error('An error occurred while fetching profile data');
      }
    };
    if (isNewPage) {
      setUserInfo(isTemplate ? RESUME_TEMPLATE : MINIMUM_RESUME_TEMPLATE);
      return;
    }
    if (walletAddress && id) {
      fetchProfileByIdAndWallet(walletAddress);
    }
  }, [walletAddress, isNewPage, id, isTemplate]);

  // Handle cancellation of edit mode
  const handleCancel = () => {
    if (originalUserInfo) {
      setUserInfo(JSON.parse(JSON.stringify(originalUserInfo)));
    }
    setEditStatus(false);
    setOriginalUserInfo(null);
  };

  const handleCreateNewProfile = async () => {
    const res = await api.post<ApiResponse<UserInfo>>('/api/profile/create', {
      profile: userInfo,
      wallet: walletAddress,
    });
    const { success, message, data } = res.data;
    if (!success || !data) {
      toast.error(message || 'Failed to create profile');
      return;
    }
    navigate(`/profile/${data._id}`);
    toast.success(message || 'Profile created successfully!');
  };

  // Handle update of existing profile
  const handleUpdateProfile = async () => {
    try {
      const res = await api.put<ApiResponse<void>>('/api/profile/update', {
        profile: userInfo,
      });
      const { success, message } = res.data;
      if (!success) {
        toast.error(message || 'Failed to update profile');
        return;
      }
      toast.success(message || 'Profile updated successfully');
    } catch (error) {
      toast.error('An error occurred while updating profile');
    }
  };

  // Handle submission of new profile
  const handleSubmit = () => {
    if (!originalUserInfo) {
      toast.info('No changes detected!');
      return;
    }
    // id is existing, create new profile
    if (!id) {
      handleCreateNewProfile();
    } else {
      handleUpdateProfile();
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
    setUserInfo(updatedUserInfo);
    setEditStatus(false);
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
      if (lastKey) {
        if (Array.isArray(current[lastKey as keyof typeof current])) {
          switch (lastKey) {
            case 'basicInfo':
            case 'descriptions':
              (current[lastKey] as string[]).push('Add description content');
              break;
            case 'list':
              (current[lastKey] as Array<{ title: string; descriptions: string[] }>).push({
                title: 'Add title',
                descriptions: ['Add description content'],
              });
              break;
            default:
              console.warn(`Unhandled array type: ${lastKey}`);
          }
        }
      }
      return newUserInfo;
    });
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete<ApiResponse<void>>(`/api/profile/delete?id=${id}`);
      const { success, message } = res.data;
      if (success) {
        toast.success(message || 'Profile deleted successfully');
        navigate('/');
      } else {
        toast.error(message || 'Failed to delete profile');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the profile');
    }
    setShowDeleteModal(false);
  };

  const renderButtonBar = () => {
    // edit mode
    if (editStatus) {
      return (
        <>
          <Button variant="light" className="small" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" className="btn btn-primary px-5" onClick={handleSave}>
            Save
          </Button>
        </>
      );
    }
    return (
      <>
        <Link to="/" className="text-underline">
          {'<'} Back
        </Link>
        <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
        <Button
          variant="light"
          className={classNames('small px-4', { 'btn btn-primary': editStatus })}
          onClick={() => {
            setOriginalUserInfo(JSON.parse(JSON.stringify(userInfo)));
            setEditStatus(true);
          }}>
          Edit
        </Button>
        <Button variant="primary" className="px-5" onClick={debounce(handleSubmit, 500)}>
          Submit
        </Button>
      </>
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
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="header">
            <h1>
              <EditComponent status={editStatus} name="name" append={false}>
                {userInfo.name}
              </EditComponent>
            </h1>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-3">{renderButtonBar()}</div>
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this profile? <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ResumePage;
