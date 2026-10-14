import React from 'react';
import { Navigate } from 'react-router-dom';

export const LogsPage: React.FC = () => {
  return <Navigate to="/account?tab=settings" replace />;
};

export default LogsPage;
