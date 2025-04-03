import React from 'react';
import Medical from '../Medical';

const DashboardMedical: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Medical Information</h1>
      <Medical />
    </div>
  );
};

export default DashboardMedical; 