
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { PhoneIcon, EnvelopeIcon, TwitterIcon, FacebookIcon, GlobeAltIcon } from '../constants';

const Footer: React.FC = () => {
  const { t } = useLocalization();

  return (
    <footer className="bg-gov-blue-900 text-neutral-white mt-8">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contactUs')}</h3>
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 mr-3" />
              <span>{t('helpline')} <a href="tel:1800-123-4567" className="hover:underline">1800-123-4567</a></span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-3" />
              <span>{t('emailSupport')} <a href="mailto:support@municipalcorp.gov.in" className="hover:underline">support@municipalcorp.gov.in</a></span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/submit" className="hover:underline">{t('submitComplaint')}</Link></li>
              <li><Link to="/track" className="hover:underline">{t('trackStatus')}</Link></li>
              <li><Link to="/terms" className="hover:underline">{t('termsOfService')}</Link></li>
              <li><Link to="/about" className="hover:underline">{t('aboutUs')}</Link></li>
            </ul>
          </div>

          {/* Portal Info */}
          <div className="space-y-4">
            <div className="flex items-center text-xl font-bold text-neutral-white">
                <GlobeAltIcon className="h-8 w-8 mr-2" aria-hidden="true" />
                <span>{t('portalTitle')}</span>
            </div>
             <p className="text-sm text-neutral-gray">{t('disclaimer')}</p>
            <div className="flex space-x-4 mt-4">
                <a href="#" aria-label="Twitter" className="text-neutral-white hover:text-gov-blue-500 transition-colors">
                    <TwitterIcon className="w-6 h-6" />
                </a>
                 <a href="#" aria-label="Facebook" className="text-neutral-white hover:text-gov-blue-500 transition-colors">
                    <FacebookIcon className="w-6 h-6" />
                </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gov-blue-500/50 text-center text-sm text-neutral-gray">
            &copy; {new Date().getFullYear()} Municipal Corporation. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
