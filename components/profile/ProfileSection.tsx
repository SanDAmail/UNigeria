
import React from 'react';

interface ProfileSectionProps {
  title: string;
  content: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, content }) => {
  return (
    <div className="bg-app-light p-4 rounded-lg">
      <h2 className="text-lg font-semibold text-primary-green mb-2 break-words">{title}</h2>
      <p className="text-secondary leading-relaxed break-words">{content}</p>
    </div>
  );
};

export default ProfileSection;