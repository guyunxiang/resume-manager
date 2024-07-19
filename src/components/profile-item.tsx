/* eslint-disable react/no-array-index-key */
import React from 'react';
import EditComponent from './edit-component';

// Define interfaces for data structures
interface ListItem {
  _id?: string;
  title: string;
  descriptions: string[];
}

interface Profile {
  _id?: string;
  title: string;
  summary?: string;
  descriptions?: string[];
  list?: ListItem[];
}

interface ProfileItemProps {
  profile: Profile;
  profileIndex: number;
  editStatus: boolean;
  onAppend: (path: string) => void;
  onDelete: (path: string) => void;
}

// ProfileItem component: Renders a profile section with editable fields
const ProfileItem: React.FC<ProfileItemProps> = React.memo(function ProfileItem({
  profile,
  profileIndex,
  editStatus,
  onAppend,
  onDelete,
}: ProfileItemProps) {
  // Helper function to generate path for profile items
  const getPath = (field: string, itemIndex?: number, descIndex?: number): string => {
    let path = `profiles[${profileIndex}].${field}`;
    if (itemIndex !== undefined) path += `[${itemIndex}]`;
    if (descIndex !== undefined) path += `.descriptions[${descIndex}]`;
    return path;
  };

  // Render description items
  const renderDescriptions = (descriptions: string[], pathPrefix: string) =>
    descriptions.map((description, descIndex) => (
      <div key={`${description}_${descIndex}`}>
        <EditComponent
          isEditable={editStatus}
          name={`${pathPrefix}[${descIndex}]`}
          onAppend={() => onAppend(pathPrefix)}
          onDelete={() => onDelete(`${pathPrefix}[${descIndex}]`)}>
          {description}
        </EditComponent>
      </div>
    ));

  // Render list items
  const renderListItems = () =>
    profile.list?.map((item, itemIndex) => (
      <div key={`${item._id}-${itemIndex}`}>
        <h3 className="subTitle">
          <EditComponent
            isEditable={editStatus}
            name={`${getPath('list', itemIndex, undefined)}.title`}
            onAppend={() => onAppend(getPath('list'))}
            onDelete={() => onDelete(getPath('list', itemIndex))}>
            {item.title}
          </EditComponent>
        </h3>
        {renderDescriptions(item.descriptions, `${getPath('list', itemIndex)}.descriptions`)}
      </div>
    ));

  return (
    <div>
      <h2 className="title">
        <EditComponent isEditable={editStatus} name={getPath('title')} onDelete={() => onDelete(getPath('title'))}>
          {profile.title}
        </EditComponent>
      </h2>
      {profile.summary && (
        <div>
          <EditComponent
            isEditable={editStatus}
            inputType="textarea"
            name={getPath('summary')}
            onAppend={() => onAppend(getPath('summary'))}
            onDelete={() => onDelete(getPath('summary'))}>
            {profile.summary}
          </EditComponent>
        </div>
      )}
      {profile.descriptions && renderDescriptions(profile.descriptions, getPath('descriptions'))}
      {renderListItems()}
    </div>
  );
});

export default ProfileItem;
