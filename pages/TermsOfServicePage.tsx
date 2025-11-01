
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const TermsOfServicePage: React.FC = () => {
    const { t } = useLocalization();

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-dark-gray mb-3">{title}</h2>
            <div className="text-neutral-dark-gray space-y-3 leading-relaxed">{children}</div>
        </div>
    );

    return (
        <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto animated-section">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-blue-900 mb-2 text-center">{t('termsTitle')}</h1>
            <p className="text-center text-sm text-gray-500 mb-8">{t('termsLastUpdated')} {new Date().toLocaleDateString()}</p>

            <Section title="1. Acceptance of Terms">
                <p>{t('termsAcceptance')}</p>
            </Section>

            <Section title="2. Platform Usage Policy">
                <p>{t('termsUsagePolicyContent1')}</p>
                <p>{t('termsUsagePolicyContent2')}</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>{t('termsUsagePolicyItem1')}</li>
                    <li>{t('termsUsagePolicyItem2')}</li>
                    <li>{t('termsUsagePolicyItem3')}</li>
                    <li>{t('termsUsagePolicyItem4')}</li>
                </ul>
            </Section>

            <Section title="3. User Responsibilities">
                <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>{t('termsUserResponsibilitiesContent1')}</li>
                    <li>{t('termsUserResponsibilitiesContent2')}</li>
                    <li>{t('termsUserResponsibilitiesContent3')}</li>
                </ul>
            </Section>

            <Section title="4. Data Privacy and Protection">
                <p>{t('termsDataPrivacyContent')}</p>
            </Section>
            
            <Section title="5. Complaint Visibility and Transparency">
                <p>{t('termsVisibilityContent')}</p>
            </Section>

            <Section title="6. Disclaimers">
                <p>{t('termsDisclaimersContent')}</p>
            </Section>
            
            <Section title="7. Governing Law and Jurisdiction">
                <p>{t('termsGoverningLawContent')}</p>
            </Section>
            
            <Section title="8. Contact Us">
                <p>{t('termsContactUsContent')}</p>
            </Section>

        </div>
    );
};

export default TermsOfServicePage;
