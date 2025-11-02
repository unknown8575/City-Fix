
import React from 'react';

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  name: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, name }) => {
  return (
    <div className="bg-neutral-white p-6 rounded-lg shadow-sm text-center">
      <Icon className="h-10 w-10 mx-auto mb-4 text-gov-blue-500" aria-hidden="true" />
      <p className="text-4xl font-extrabold text-gov-blue-900 mb-2">{value}</p>
      <p className="text-neutral-dark-gray text-lg">{name}</p>
    </div>
  );
};

export default StatCard;