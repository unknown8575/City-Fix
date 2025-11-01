import React from 'react';

const DashboardStatCard: React.FC<{ icon: React.FC<React.SVGProps<SVGSVGElement>>, value: string | number, name: string, color: string }> = ({ icon: Icon, value, name, color }) => (
    <div className="bg-neutral-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-neutral-dark-gray">{value}</p>
            <p className="text-sm text-gray-500">{name}</p>
        </div>
    </div>
);

export default DashboardStatCard;
