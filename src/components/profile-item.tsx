import React from 'react';
import EditComponent from './edit-component';

import plusIcon from '../assets/plus-lg.svg';

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
}

const ProfileItem: React.FC<ProfileItemProps> = React.memo(function ProfileItem({
  profile,
  profileIndex,
  editStatus,
}: ProfileItemProps) {
  return (
    <div>
      <h2 className="title">
        <EditComponent
          key={`profile-title-${profileIndex}`}
          status={editStatus}
          name={`profiles[${profileIndex}].title`}>
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
          <p key={description}>
            <EditComponent status={editStatus} name={`profiles[${profileIndex}].descriptions[${descIndex}]`}>
              {description}
            </EditComponent>
          </p>
        ))}
      {profile.list &&
        profile.list.map((item, itemIndex) => (
          <div key={item.title}>
            <h3 className="subTitle">
              <EditComponent status={editStatus} name={`profiles[${profileIndex}].list[${itemIndex}].title`}>
                {item.title}
              </EditComponent>
            </h3>
            {item.descriptions.map((description, descIndex) => (
              <p key={description}>
                <EditComponent
                  status={editStatus}
                  name={`profiles[${profileIndex}].list[${itemIndex}].descriptions[${descIndex}]`}>
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
