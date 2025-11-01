
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { CheckCircleIcon, GlobeAltIcon, MagnifyingGlassCircleIcon, UserGroupIcon, ChatBubbleBottomCenterTextIcon } from '../constants';

const FeatureItem: React.FC<{ icon: React.FC<React.SVGProps<SVGSVGElement>>; text: string }> = ({ icon: Icon, text }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
            <Icon className="h-7 w-7 text-action-green-500" />
        </div>
        <p className="text-neutral-dark-gray">{text}</p>
    </div>
);

const AboutUsPage: React.FC = () => {
    const { t } = useLocalization();
    const features = [
        { icon: MagnifyingGlassCircleIcon, text: t('aboutFeatureAI') },
        { icon: GlobeAltIcon, text: t('aboutFeatureMultilingual') },
        { icon: CheckCircleIcon, text: t('aboutFeatureTracking') },
        { icon: UserGroupIcon, text: t('aboutFeatureAnalytics') },
        { icon: ChatBubbleBottomCenterTextIcon, text: t('aboutFeatureAccessibility') },
    ];

    return (
        <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto animated-section">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-blue-900 mb-4 text-center">{t('aboutTitle')}</h1>
            <p className="text-lg text-neutral-dark-gray text-center mb-10">{t('aboutIntro')}</p>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-dark-gray mb-3 border-b-2 border-gov-blue-500 pb-2">{t('aboutMissionTitle')}</h2>
                    <p className="text-neutral-dark-gray leading-relaxed">{t('aboutMissionContent')}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-dark-gray mb-3 border-b-2 border-gov-blue-500 pb-2">{t('aboutWhatWeDoTitle')}</h2>
                    <p className="text-neutral-dark-gray leading-relaxed">{t('aboutWhatWeDoContent')}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-dark-gray mb-4 border-b-2 border-gov-blue-500 pb-2">{t('aboutFeaturesTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {features.map((feature, index) => (
                             <FeatureItem key={index} icon={feature.icon} text={feature.text} />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-dark-gray mb-3 border-b-2 border-gov-blue-500 pb-2">{t('aboutCommitmentTitle')}</h2>
                    <p className="text-neutral-dark-gray leading-relaxed">{t('aboutCommitmentContent')}</p>
                </div>
                <div className="bg-gov-blue-500/10 p-6 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-gov-blue-900 mb-3">{t('aboutJoinUsTitle')}</h2>
                    <p className="text-neutral-dark-gray leading-relaxed">{t('aboutJoinUsContent')}</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
