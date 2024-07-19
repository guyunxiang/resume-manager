/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, ButtonGroup, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import EditComponent from '../../components/edit-component';
import ProfileItem from '../../components/profile-item';
import Loading from '../../components/loading';

import { useAppContext } from '../../components/app-context';
import { RESUME_TEMPLATE, MINIMUM_RESUME_TEMPLATE } from '../../libs/const';
import useApiGet from '../../hooks/use-api-get';
import useApiMutation from '../../hooks/use-api-mutation';

import './index.css';
import PageLoading from '../../components/page-loading';

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

function ResumePage(): React.ReactElement {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id: profileId } = useParams();
  const [searchParams] = useSearchParams();
  const { t, locale } = useLocaleContext();
  const { previewMode, setPreviewMode } = useAppContext();

  // State variables
  const formRef = useRef<HTMLFormElement>(null);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalUserInfo, setOriginalUserInfo] = useState<ProfileData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);

  // Derived state
  const isNewPage = pathname === '/profile/new';
  const isTemplate = searchParams.get('template') === 'true';

  // API calls using custom hooks
  const { data: walletAddress } = useApiGet<string>('/api/address/query');
  const { data: fetchedProfile, loading: profileLoading } = useApiGet<ProfileData>(
    walletAddress && profileId ? `/api/profile/query?wallet=${walletAddress}&id=${profileId}` : null,
  );
  const { mutate: createProfile, loading: createLoading } = useApiMutation<ProfileData>('/api/profile/create', 'post');
  const { mutate: updateProfile, loading: updateLoading } = useApiMutation<void>('/api/profile/update', 'put');
  const { mutate: deleteProfile, loading: deleteLoading } = useApiMutation<void>(
    `/api/profile/delete?id=${profileId}`,
    'delete',
  );

  // Combine all loading states
  const isLoading = profileLoading || createLoading || updateLoading || deleteLoading;

  // Use effect to set profile data
  useEffect(() => {
    if (isNewPage) {
      const template = MINIMUM_RESUME_TEMPLATE[locale] ?? MINIMUM_RESUME_TEMPLATE.en ?? null;
      setProfileData(isTemplate ? RESUME_TEMPLATE : template);
    } else if (fetchedProfile) {
      setProfileData(fetchedProfile);
    }
  }, [isNewPage, isTemplate, fetchedProfile, locale]);

  // Use effect to listening press Esc key to exit preview mode
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
  }, [setPreviewMode]);

  // Handle creation of new profile
  const handleCreateNewProfile = useCallback(
    async (profile: ProfileData) => {
      // Prevent multiple submissions
      if (createLoading) return;
      try {
        const result = await createProfile({ profile, wallet: walletAddress });
        if (result.success && result.data) {
          navigate(`/profile/${result.data._id}`);
          setEditStatus(false);
        }
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    },
    [createLoading, createProfile, navigate, walletAddress],
  );

  // Handle update of existing profile
  const handleUpdateProfile = useCallback(
    async (profile: ProfileData) => {
      // Prevent multiple submissions
      if (updateLoading) return;
      try {
        const result = await updateProfile({ profile });
        if (result.success) {
          setEditStatus(false);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
    [updateLoading, updateProfile],
  );

  // Handle delete profile
  const handleDeleteProfile = useCallback(async () => {
    // Prevent multiple submissions
    if (deleteLoading) return;
    try {
      const result = await deleteProfile();
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
    setShowDeleteModal(false);
  }, [deleteLoading, deleteProfile, navigate]);

  // Handle cancellation of edit mode
  const handleCancel = () => {
    if (originalUserInfo) {
      setProfileData(JSON.parse(JSON.stringify(originalUserInfo)));
    }
    setEditStatus(false);
    setOriginalUserInfo(null);
  };

  // Handle submission of profile
  const handleSubmit = useCallback(
    (updatedProfileData: ProfileData) => {
      if (!originalUserInfo) {
        toast.info(t('message.info.noChange'));
        return;
      }
      if (!profileId) {
        handleCreateNewProfile(updatedProfileData);
      } else {
        handleUpdateProfile(updatedProfileData);
      }
    },
    [originalUserInfo, profileId, handleCreateNewProfile, handleUpdateProfile, t],
  );

  // Handle save action
  const handleSave = useCallback(
    (submit?: boolean) => {
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const updatedProfileData = { ...profileData } as ProfileData;

      // Update nested object properties based on form field names
      // obj, the object to update, keys
      // keys, the keys representing the path to property
      // value, the value to set
      const updateNestedProperty = (obj: any, keys: string[], value: string): void => {
        const key = keys.shift();
        if (key === undefined) return;

        if (keys.length === 0) {
          obj[key] = value;
        } else {
          if (typeof obj[key] !== 'object') {
            obj[key] = {};
          }
          updateNestedProperty(obj[key], keys, value);
        }
      };

      // Process each form field
      formData.forEach((value, name) => {
        const keys = name.replace(/\[(\w+)\]/g, '.$1').split('.');
        updateNestedProperty(updatedProfileData, keys, value.toString());
      });

      setProfileData(updatedProfileData);

      if (submit) {
        handleSubmit(updatedProfileData);
      }
    },
    [profileData, handleSubmit],
  );

  // Handle append a new item into profile
  const handleAppendItem = useCallback(
    (path: string) => {
      handleSave();
      setProfileData((prevProfileData) => {
        if (!prevProfileData) return null;
        const newProfileData = JSON.parse(JSON.stringify(prevProfileData));

        // Fint the target array
        // obj, current object
        // keys, the remaining keys path
        const findTargetArray = (obj: any, keys: string[]): any[] | null => {
          if (keys.length === 0) return null;
          const currentKey = keys[0];
          if (!currentKey) return null;
          if (currentKey.includes('[')) {
            const [arrayName, indexStr] = currentKey.split(/\[|\]/);
            if (!arrayName || !indexStr) return null;
            const index = parseInt(indexStr, 10);
            if (Number.isNaN(index) || !obj[arrayName] || !Array.isArray(obj[arrayName])) return null;
            return keys.length === 1 ? obj[arrayName] : findTargetArray(obj[arrayName][index], keys.slice(1));
          }
          return keys.length === 1 ? obj[currentKey] : findTargetArray(obj[currentKey], keys.slice(1));
        };

        const keys = path.split('.');
        const targetArray = findTargetArray(newProfileData, keys);

        if (Array.isArray(targetArray)) {
          const lastKey = keys[keys.length - 1];
          switch (lastKey) {
            case 'basicInfo':
            case 'descriptions':
              targetArray.push('');
              break;
            case 'list':
              targetArray.push({
                title: t('templates.workExperience.jobTitle'),
                descriptions: [t('templates.workExperience.defaultJobDescription')],
              });
              break;
            default:
              console.warn(`Unhandled array type: ${lastKey}`);
          }
        }

        return newProfileData;
      });
    },
    [handleSave, t],
  );

  // Handle delete an item
  const handleDeleteItem = useCallback(
    (path: string) => {
      // Save current state before modification
      handleSave();
      setProfileData((preProfileData) => {
        // Return null if there's no profile data
        if (!preProfileData) return null;

        // Deep copy to avoid mutation
        const newProfileData = JSON.parse(JSON.stringify(preProfileData));
        // Split the path into keys
        const keys = path.split('.');
        let current: any = newProfileData;
        let parent: any = null;
        let lastArrayName: string | null = null;

        // Traverse the path, stopping before the last key
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (key && key.includes('[')) {
            // Handle array index access
            const [arrayName, indexStr] = key.split('[');
            if (arrayName && indexStr) {
              const index = parseInt(indexStr.replace(']', ''), 10);
              if (!Number.isNaN(index)) {
                parent = current;
                lastArrayName = arrayName;
                current = current[arrayName][index];
              } else {
                // Return original if index is NaN
                return preProfileData;
              }
            }
          } else if (key) {
            // Handle object key access
            parent = current;
            lastArrayName = key;
            current = current[key];
          } else {
            // Return original if key is invalid
            return preProfileData;
          }
        }

        const lastKey = keys[keys.length - 1];
        if (lastKey && lastKey.includes('[')) {
          // Handle final array element deletion
          const [arrayName, indexStr] = lastKey.split('[');
          if (arrayName && indexStr) {
            const index = parseInt(indexStr.replace(']', ''), 10);
            if (!Number.isNaN(index) && Array.isArray(current[arrayName])) {
              if (arrayName === 'basicInfo' && current[arrayName].length <= 1) {
                // Warn if deleting last item
                toast.warn(t('message.warning.deleteItem'));
              } else {
                // Remove item at index
                current[arrayName].splice(index, 1);
              }
            }
          }
        } else if (lastKey && Array.isArray(current)) {
          // Handle deletion when current is an array
          const index = parseInt(lastKey, 10);
          if (!Number.isNaN(index)) {
            if (lastArrayName === 'basicInfo' && current.length <= 1) {
              // Warn if deleting last item
              toast.warn(t('message.warning.deleteItem'));
            } else {
              // Remove item at index
              current.splice(index, 1);
            }
          }
        } else if (parent && lastArrayName) {
          // Handle deletion for non-array fields
          if (Array.isArray(parent[lastArrayName])) {
            if (lastArrayName === 'basicInfo' && parent[lastArrayName].length <= 1) {
              // Warn if deleting last item
              toast.warn(t('message.warning.deleteItem'));
            } else {
              // Filter out current item
              parent[lastArrayName] = parent[lastArrayName].filter((item: any) => item !== current);
            }
          } else {
            // Set non-array field to undefined
            parent[lastArrayName] = undefined;
          }
        }

        // Remove empty arrays or objects in profiles
        if (lastArrayName === 'profiles') {
          newProfileData.profiles = newProfileData.profiles.filter(
            (profile: any) =>
              profile.summary ||
              (profile.descriptions && profile.descriptions.length) ||
              (profile.list && profile.list.length),
          );
        }
        return newProfileData; // Return updated profile data
      });
    },
    [handleSave, t],
  );

  // Handle append a section into profile likes summary, work experience, education
  const handleAppendProfile = () => {
    setProfileData((preProfileData) => {
      if (!preProfileData) return null;
      const newProfileData = JSON.parse(JSON.stringify(preProfileData));
      switch (selectedTemplate) {
        case 0:
          newProfileData.profiles.push({
            title: t('templates.summary.title'),
            summary: t('templates.summary.defaultContent'),
          });
          break;
        case 1:
          newProfileData.profiles.push({
            title: t('templates.workExperience.title'),
            list: [
              {
                title: t('templates.workExperience.jobTitle'),
                descriptions: [t('templates.workExperience.defaultJobDescription')],
              },
            ],
          });
          break;
        case 2:
          newProfileData.profiles.push({
            title: t('templates.education.title'),
            descriptions: [t('templates.education.defaultContent')],
          });
          break;
        case 3:
          newProfileData.profiles.push({
            title: t('templates.commonItems.title'),
            descriptions: [t('templates.commonItems.defaultContent')],
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
        {t('btn.preview')}
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
            {t('btn.edit')}
          </Button>
          <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/')}>
            {t('btn.back')}
          </Button>
        </div>
      );
    const templates = [t('title.summary'), t('title.work'), t('title.education'), t('title.common')];
    return (
      <div className="d-flex flex-column gap-3">
        <ButtonGroup className="w-100">
          <Button className="px-3 text-nowrap" onClick={handleAppendProfile}>
            {t('btn.append')}
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
          disabled={isLoading}
          onClick={() => handleSave(true)}>
          <Loading loading={isLoading} />
          {t('btn.submit')}
        </Button>
        <Button variant="secondary" className="w-100" onClick={handleCancel}>
          {t('btn.cancel')}
        </Button>
        <Button className="w-100" variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
          {t('btn.delete')}
        </Button>
      </div>
    );
  };

  // Render loading spinner while data is being fetched
  if (!profileData || profileLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {showAlert && (
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
      )}
      <div className="resume-page container px-3">
        <form ref={formRef}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
            <div className="header">
              <h1>
                <EditComponent isEditable={editStatus} name="name">
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
                    isEditable={editStatus}
                    name={`basicInfo[${index}]`}
                    onAppend={() => handleAppendItem('basicInfo')}
                    onDelete={() => handleDeleteItem(`basicInfo[${index}]`)}>
                    {text}
                  </EditComponent>
                </div>
              ))}
              <hr />
              {renderAppendBtnGroup()}
            </div>
            <div className="profile flex-1" key={locale}>
              {profileData.profiles.map((profile, index) => (
                <ProfileItem
                  key={`${profile._id}-${index}_${locale}`}
                  profile={profile}
                  profileIndex={index}
                  editStatus={editStatus}
                  onAppend={handleAppendItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>
        </form>
        <Modal
          centered
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
          }}>
          <Modal.Header closeButton>
            <Modal.Title>{t('modal.deleteProfile.title')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{t('modal.deleteProfile.text')}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('modal.deleteProfile.cancelButton')}
            </Button>
            <Button variant="danger" onClick={handleDeleteProfile}>
              <Loading loading={isLoading} />
              {t('modal.deleteProfile.deleteButton')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ResumePage;
