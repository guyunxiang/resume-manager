/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal, Spinner } from 'react-bootstrap';

import EditComponent from '../../components/edit-component';
import ProfileItem from '../../components/profile-item';
import Loading from '../../components/loading';

import { RESUME_TEMPLATE, MINIMUM_RESUME_TEMPLATE } from '../../libs/const';
import api from '../../libs/api';

import './index.css';

// Define the structure of user information
interface ProfileData {
  _id?: string;
  name: string;
  basicInfo: string[];
  profiles: Array<{
    _id?: string;
    title: string;
    summary?: string;
    descriptions?: string[];
    list?: Array<{
      _id?: string;
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
  // Validate if on create profile page
  const isNewPage = pathname === '/profile/new';
  // Get profile id from url
  const { id: profileId } = useParams();
  // Get isTemplate, if true, display template profile
  const [searchParams] = useSearchParams();
  const isTemplate = searchParams.get('template') === 'true';

  const formRef = useRef<HTMLFormElement>(null);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalUserInfo, setOriginalUserInfo] = useState<ProfileData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Preview mode
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setShowAlert(false);
        setPreviewMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
        const res = await api.get<ApiResponse<ProfileData>>(`/api/profile/query?wallet=${wallet}&id=${profileId}`);
        const { success, data } = res.data;
        if (!success || !data) {
          toast.error('Failed to obtain the current profile!');
          setProfileData(MINIMUM_RESUME_TEMPLATE);
          return;
        }
        setProfileData(data);
      } catch (error) {
        toast.error('An error occurred while fetching profile data');
      }
    };
    if (isNewPage) {
      setProfileData(isTemplate ? RESUME_TEMPLATE : MINIMUM_RESUME_TEMPLATE);
      return;
    }
    if (walletAddress && profileId) {
      fetchProfileByIdAndWallet(walletAddress);
    }
  }, [walletAddress, isNewPage, profileId, isTemplate]);

  // Handle cancellation of edit mode
  const handleCancel = () => {
    if (originalUserInfo) {
      setProfileData(JSON.parse(JSON.stringify(originalUserInfo)));
    }
    setEditStatus(false);
    setOriginalUserInfo(null);
  };

  const handleCreateNewProfile = async (profile: ProfileData) => {
    try {
      setLoading(true);
      const res = await api.post<ApiResponse<ProfileData>>('/api/profile/create', {
        profile,
        wallet: walletAddress,
      });
      setLoading(false);
      const { success, message, data } = res.data;
      if (!success || !data) {
        toast.error(message || 'Failed to create profile');
        return;
      }
      navigate(`/profile/${data._id}`);
      setEditStatus(false);
      toast.success(message || 'Profile created successfully!');
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred while create profile');
    }
  };

  // Handle update of existing profile
  const handleUpdateProfile = async (profile: ProfileData) => {
    try {
      setLoading(true);
      const res = await api.put<ApiResponse<void>>('/api/profile/update', {
        profile,
      });
      setLoading(false);
      const { success, message } = res.data;
      if (!success) {
        toast.error(message || 'Failed to update profile');
        return;
      }
      setEditStatus(false);
      toast.success(message || 'Profile updated successfully');
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred while updating profile');
    }
  };

  // Handle submission of new profile
  const handleSubmit = (updateProfileData: ProfileData) => {
    if (!originalUserInfo) {
      toast.info('No changes detected!');
      return;
    }
    // id is existing, create new profile
    if (!profileId) {
      handleCreateNewProfile(updateProfileData);
    } else {
      handleUpdateProfile(updateProfileData);
    }
  };

  // Handle save action
  const handleSave = (submit?: boolean) => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const updateProfileData = { ...profileData } as ProfileData;

    for (const [name, value] of formData.entries()) {
      const keys = name.replace(/\[(\w+)\]/g, '.$1').split('.');
      let current: any = updateProfileData;

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
    setProfileData(updateProfileData);
    if (submit) {
      handleSubmit(updateProfileData);
    }
  };

  // Handle append a new item into profile
  const handleAppend = (path: string) => {
    handleSave();
    setProfileData((preProfileData) => {
      if (!preProfileData) return null;

      const newProfileData = JSON.parse(JSON.stringify(preProfileData));
      const keys = path.split('.');
      let current: any = newProfileData;

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
              return preProfileData;
            }
          } else {
            return preProfileData;
          }
        } else if (key) {
          current = current[key];
        } else {
          return preProfileData;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        if (Array.isArray(current[lastKey as keyof typeof current])) {
          switch (lastKey) {
            case 'basicInfo':
            case 'descriptions':
              (current[lastKey] as string[]).push('');
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
      return newProfileData;
    });
  };

  // Hanlde delete an item
  const handleDeleteItem = (path: string) => {
    handleSave();
    setProfileData((preProfileData) => {
      if (!preProfileData) return null;

      const newProfileData = JSON.parse(JSON.stringify(preProfileData));
      const keys = path.split('.');
      let current: any = newProfileData;
      let parent: any = null;
      let lastArrayName: string | null = null;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key && key.includes('[')) {
          const [arrayName, indexStr] = key.split('[');
          if (arrayName && indexStr) {
            const index = parseInt(indexStr.replace(']', ''), 10);
            if (!Number.isNaN(index)) {
              parent = current;
              lastArrayName = arrayName;
              current = current[arrayName][index];
            } else {
              return preProfileData;
            }
          }
        } else if (key) {
          parent = current;
          lastArrayName = key;
          current = current[key];
        } else {
          return preProfileData;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey && lastKey.includes('[')) {
        const [arrayName, indexStr] = lastKey.split('[');
        if (arrayName && indexStr) {
          const index = parseInt(indexStr.replace(']', ''), 10);
          if (!Number.isNaN(index) && Array.isArray(current[arrayName])) {
            if (arrayName === 'basicInfo' && current[arrayName].length <= 1) {
              toast.warn('Cannot delete the last item in basicInfo.');
            } else {
              current[arrayName].splice(index, 1);
            }
          }
        }
      } else if (lastKey && Array.isArray(current)) {
        const index = parseInt(lastKey, 10);
        if (!Number.isNaN(index)) {
          if (lastArrayName === 'basicInfo' && current.length <= 1) {
            toast.warn('Cannot delete the last item in basicInfo.');
          } else {
            current.splice(index, 1);
          }
        }
      } else if (parent && lastArrayName) {
        // For non-array fields like 'summary'
        if (Array.isArray(parent[lastArrayName])) {
          if (lastArrayName === 'basicInfo' && parent[lastArrayName].length <= 1) {
            toast.warn('Cannot delete the last item in basicInfo.');
          } else {
            parent[lastArrayName] = parent[lastArrayName].filter((item: any) => item !== current);
          }
        } else {
          // For single items, we can set it to undefined or null
          parent[lastArrayName] = undefined;
        }
      }

      // Remove empty arrays or objects in profiles
      if (lastArrayName === 'profiles') {
        newProfileData.profiles = newProfileData.profiles.filter((profile: any) => {
          if (
            profile.summary ||
            (profile.descriptions && profile.descriptions.length) ||
            (profile.list && profile.list.length)
          ) {
            return true;
          }
          return false;
        });
      }
      return newProfileData;
    });
  };

  // Handle delete profile
  const handleDelete = async () => {
    try {
      const res = await api.delete<ApiResponse<void>>(`/api/profile/delete?id=${profileId}`);
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

  // Handle append a section into profile likes summary, work experience, education
  const handleAppendProfile = () => {
    setProfileData((preProfileData) => {
      if (!preProfileData) return null;

      const newProfileData = JSON.parse(JSON.stringify(preProfileData));

      switch (selectedTemplate) {
        case 0:
          newProfileData.profiles.push({
            title: 'Summary',
            summary: 'Add your summary here',
          });
          break;
        case 1:
          newProfileData.profiles.push({
            title: 'Work Experience',
            list: [
              {
                title: 'Job Title',
                descriptions: ['Add your job description here'],
              },
            ],
          });
          break;
        case 2:
          newProfileData.profiles.push({
            title: 'Education',
            descriptions: ['Add your education details here'],
          });
          break;
        case 3:
          newProfileData.profiles.push({
            title: 'Common Items',
            descriptions: ['Add common items here'],
          });
          break;
        default:
          break;
      }

      return newProfileData;
    });
  };

  // Render Action bar
  const renderActionBar = () => {
    if (previewMode) return null;
    if (editStatus) return null;
    return (
      <Button
        variant="primary"
        className="px-5 w-100"
        disabled={editStatus}
        onClick={() => {
          const read = localStorage.getItem('esc-read');
          if (!read) {
            setShowAlert(true);
          }
          setPreviewMode(true);
        }}>
        Preview
      </Button>
    );
  };

  // Render the append button group
  const renderAppendBtnGroup = () => {
    if (previewMode) return null;
    if (!editStatus)
      return (
        <div className="d-flex flex-column gap-3">
          <Button
            variant="primary"
            className="px-5 w-100"
            disabled={editStatus}
            onClick={() => {
              setOriginalUserInfo(JSON.parse(JSON.stringify(profileData)));
              setEditStatus(true);
            }}>
            Edit
          </Button>
          <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/')}>
            {'<'} Back
          </Button>
        </div>
      );
    const templates = ['Summary', 'Work Experience', 'Education', 'Common Items'];
    return (
      <div className="d-flex flex-column gap-3">
        <ButtonGroup className="w-100">
          <Button className="px-3" onClick={handleAppendProfile}>
            Append
          </Button>
          <DropdownButton
            className="w-100"
            as={ButtonGroup}
            title={templates[selectedTemplate]}
            onSelect={(eventKey) => setSelectedTemplate(parseInt(eventKey || '0', 10))}>
            {templates.map((template, index) => (
              <Dropdown.Item key={index} eventKey={index}>
                {template}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </ButtonGroup>
        <hr />
        <Button
          variant="primary"
          className="w-100 btn btn-primary px-5"
          disabled={loading}
          onClick={() => handleSave(true)}>
          <Loading loading={loading} />
          Submit
        </Button>
        <Button variant="secondary" className="w-100" onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="w-100" variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>
    );
  };

  // Render loading spinner while data is being fetched
  if (!profileData) {
    return (
      <div className="loading-content">
        <div className="d-flex align-items-center gap-3">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  return (
    <>
      {showAlert ? (
        <div className="alert alert-info alert-dismissible rounded-0 border-0 text-center px-3" role="alert">
          Press <strong>ESC</strong> key to exit.
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => {
              localStorage.setItem('esc-read', 'true');
              setShowAlert(false);
            }}
          />
        </div>
      ) : null}
      <div className="resume-page container px-3">
        <form ref={formRef}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
            <div className="header">
              <h1>
                <EditComponent status={editStatus} name="name">
                  {profileData.name}
                </EditComponent>
              </h1>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-3">{renderActionBar()}</div>
          </div>
          <hr className="mb-3 mb-md-5" />
          <div className="d-flex flex-column flex-md-row gap-4 ">
            <div className="basicInfo">
              {profileData.basicInfo.map((text, index) => (
                <div className="mb-3" key={`${text}-${index}`}>
                  <EditComponent
                    status={editStatus}
                    name={`basicInfo[${index}]`}
                    onAppend={() => handleAppend('basicInfo')}
                    onDelete={() => handleDeleteItem(`basicInfo[${index}]`)}>
                    {text}
                  </EditComponent>
                </div>
              ))}
              <hr />
              {renderAppendBtnGroup()}
            </div>
            <div className="profile flex-1">
              {profileData.profiles.map((profile, index) => (
                <ProfileItem
                  key={profile._id || index}
                  profile={profile}
                  profileIndex={index}
                  editStatus={editStatus}
                  onAppend={handleAppend}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>
        </form>
        <Modal
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
          }}>
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
              <Loading loading={loading} />
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default ResumePage;
