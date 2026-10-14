import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  return <Navigate to="/account?tab=profile" replace />;
};

export default ProfilePage;
