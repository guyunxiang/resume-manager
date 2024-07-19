/* eslint-disable react/no-array-index-key */
/* Index keys are used to locate child components */
import React from 'react';
import EditComponent from './edit-component';

interface ListItem {
  title: string;
  descriptions: string[];
}

interface Profile {
  title: string;
  summary?: string;
  descriptions?: string[];
  list?: ListItem[];
}

interface ProfileItemProps {
  index: number;
  profile: Profile;
  profileIndex: number;
  editStatus: boolean;
  onAppend: (path: string) => void;
  onDelete: (path: string) => void;
}

const ProfileItem: React.FC<ProfileItemProps> = React.memo(function ProfileItem({
  index,
  profile,
  profileIndex,
  editStatus,
  onAppend,
  onDelete,
}: ProfileItemProps) {
  return (
    <div key={index}>
      <h2 className="title">
        <EditComponent
          status={editStatus}
          key={`${profile.title}-${profileIndex}`}
          name={`profiles[${profileIndex}].title`}
          onDelete={() => onDelete(`profiles[${profileIndex}].title`)}>
          {profile.title}
        </EditComponent>
      </h2>
      {profile.summary && (
        <div>
          <EditComponent
            status={editStatus}
            type="textarea"
            key={`${profile.summary}-${profileIndex}`}
            name={`profiles[${profileIndex}].summary`}
            onAppend={() => onAppend(`profiles[${profileIndex}].summary`)}
            onDelete={() => onDelete(`profiles[${profileIndex}].summary`)}>
            {profile.summary}
          </EditComponent>
        </div>
      )}
      {profile.descriptions &&
        profile.descriptions.map((description, descIndex) => (
          <div key={`${description}_${descIndex}`}>
            <EditComponent
              status={editStatus}
              name={`profiles[${profileIndex}].descriptions[${descIndex}]`}
              onAppend={() => onAppend(`profiles[${profileIndex}].descriptions`)}
              onDelete={() => onDelete(`profiles[${profileIndex}].descriptions[${descIndex}]`)}>
              {description}
            </EditComponent>
          </div>
        ))}
      {profile.list &&
        profile.list.map((item, itemIndex) => (
          <div key={`${item.title}_${itemIndex}`}>
            <h3 className="subTitle">
              <EditComponent
                status={editStatus}
                name={`profiles[${profileIndex}].list[${itemIndex}].title`}
                onAppend={() => onAppend(`profiles[${profileIndex}].list`)}
                onDelete={() => onDelete(`profiles[${profileIndex}].list[${itemIndex}]`)}>
                {item.title}
              </EditComponent>
            </h3>
            {item.descriptions.map((description, descIndex) => (
              <div key={`${description}_${itemIndex}_${descIndex}`}>
                <EditComponent
                  status={editStatus}
                  name={`profiles[${profileIndex}].list[${itemIndex}].descriptions[${descIndex}]`}
                  onAppend={() => onAppend(`profiles[${profileIndex}].list[${itemIndex}].descriptions`)}
                  onDelete={() => onDelete(`profiles[${profileIndex}].list[${itemIndex}].descriptions[${descIndex}]`)}>
                  {description}
                </EditComponent>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
});

export default ProfileItem;
