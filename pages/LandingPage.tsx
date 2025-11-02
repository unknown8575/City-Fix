

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useLocalization } from '../hooks/useLocalization';
import { HandThumbUpIcon, ChatBubbleBottomCenterTextIcon, ClockIcon } from '../constants';
import StatCard from '../components/StatCard';
import { fetchAnalyticsStats } from '../services/complaintService';
import { Stat } from '../types';

const LandingPage: React.FC = () => {
  const { t } = useLocalization();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
        try {
            const data = await fetchAnalyticsStats();
            const fetchedStats: Stat[] = [
                { name: t('processedLastMonth'), value: data.processedLast30Days, icon: ChatBubbleBottomCenterTextIcon },
                { name: t('averageResolution'), value: `${data.avgResolutionHours} hrs`, icon: ClockIcon },
                { name: t('citizenSatisfaction'), value: `${data.citizenSatisfaction}`, icon: HandThumbUpIcon },
            ];
            setStats(fetchedStats);
        } catch (error) {
            console.error("Failed to fetch stats", error);
            // Fallback stats
            setStats([
                { name: t('processedLastMonth'), value: '3,200+', icon: ChatBubbleBottomCenterTextIcon },
                { name: t('averageResolution'), value: '18 hrs', icon: ClockIcon },
                { name: t('citizenSatisfaction'), value: '89%', icon: HandThumbUpIcon },
            ]);
        } finally {
            setLoading(false);
        }
    };
    getStats();
  }, [t]);

  return (
    <div className="py-8">
      <section className="text-center mb-12 bg-gov-blue-900 text-neutral-white py-16 px-4 rounded-lg shadow-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight text-neutral-white">
          {t('trackCivicComplaints')}
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto">
          {t('landingSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/submit" className="button-link">
            <Button variant="secondary" className="w-full sm:w-auto text-lg">
              {t('submitNewComplaint')}
            </Button>
          </Link>
          <Link to="/track" className="button-link">
            <Button variant="outline" className="w-full sm:w-auto border-neutral-white text-neutral-white hover:text-gov-blue-900 hover:bg-neutral-white text-lg">
              {t('trackMyComplaint')}
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="inline-block text-3xl font-bold text-neutral-dark-gray px-6 py-2 border-2 border-neutral-dark-gray">
            {t('ourImpact')}
          </h2>
        </div>
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => <div key={i} className="bg-neutral-gray h-48 rounded-lg"></div>)}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} name={stat.name} value={stat.value} icon={stat.icon} />
            ))}
            </div>
        )}
      </section>

      <section className="text-center bg-neutral-white p-8 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold text-center text-neutral-dark-gray mb-4">
          {t('howItWorks')}
        </h2>
        <p className="text-lg text-neutral-dark-gray max-w-3xl mx-auto mb-8">
          {t('howItWorksDesc')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-12">
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="bg-gov-blue-500 text-neutral-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-3">1</div>
            <p className="font-semibold text-neutral-dark-gray text-lg">{t('submitSimple')}</p>
          </div>
          <div className="text-gov-blue-500 text-4xl font-light hidden sm:block">&rarr;</div>
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="bg-gov-blue-500 text-neutral-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-3">2</div>
            <p className="font-semibold text-neutral-dark-gray text-lg">{t('aiProcesses')}</p>
          </div>
          <div className="text-gov-blue-500 text-4xl font-light hidden sm:block">&rarr;</div>
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="bg-action-green-500 text-neutral-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-3">3</div>
            <p className="font-semibold text-neutral-dark-gray text-lg">{t('quickResolution')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
