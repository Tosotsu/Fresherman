import React from 'react';
import Employment from '../Employment';

const DashboardEmployment: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Employment Information</h1>
      <Employment />
    </div>
  );
};

export default DashboardEmployment; 