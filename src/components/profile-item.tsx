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
  profile: Profile;
  profileIndex: number;
  editStatus: boolean;
  onAppend: (path: string) => void;
}

const ProfileItem: React.FC<ProfileItemProps> = React.memo(function ProfileItem({
  profile,
  profileIndex,
  editStatus,
  onAppend,
}: ProfileItemProps) {
  return (
    <div>
      <h2 className="title">
        <EditComponent
          key={`profile-title-${profileIndex}`}
          status={editStatus}
          name={`profiles[${profileIndex}].title`}
          append={false}>
          {profile.title}
        </EditComponent>
      </h2>
      {profile.summary && (
        <p>
          <EditComponent status={editStatus} type="textarea" name={`profiles[${profileIndex}].summary`}>
            {profile.summary}
          </EditComponent>
        </p>
      )}
      {profile.descriptions &&
        profile.descriptions.map((description, descIndex) => (
          <p key={`${description}_${descIndex}`}>
            <EditComponent
              status={editStatus}
              name={`profiles[${profileIndex}].descriptions[${descIndex}]`}
              onAppend={() => onAppend(`profiles[${profileIndex}].descriptions`)}>
              {description}
            </EditComponent>
          </p>
        ))}
      {profile.list &&
        profile.list.map((item, itemIndex) => (
          <div key={`${item.title}_${itemIndex}`}>
            <h3 className="subTitle">
              <EditComponent
                status={editStatus}
                name={`profiles[${profileIndex}].list[${itemIndex}].title`}
                onAppend={() => onAppend(`profiles[${profileIndex}].list`)}>
                {item.title}
              </EditComponent>
            </h3>
            {item.descriptions.map((description, descIndex) => (
              <p key={`${description}_${itemIndex}_${descIndex}`}>
                <EditComponent
                  status={editStatus}
                  name={`profiles[${profileIndex}].list[${itemIndex}].descriptions[${descIndex}]`}
                  onAppend={() => onAppend(`profiles[${profileIndex}].list[${itemIndex}].descriptions`)}>
                  {description}
                </EditComponent>
              </p>
            ))}
          </div>
        ))}
    </div>
  );
});

export default ProfileItem;
