

import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { PhoneIcon, EnvelopeIcon, CheckCircleIcon } from '../constants';

const SupportPage: React.FC = () => {
  const { t } = useLocalization();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    ticketId: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<typeof formState>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<typeof formState> = {};
    if (!formState.name) newErrors.name = t('nameRequired');
    if (!formState.email || !/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = t('emailRequired');
    if (!formState.message) newErrors.message = t('messageRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    console.log("Submitting support message:", formState);
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
    }, 1000);
  };
  
  if (isSubmitted) {
      return (
          <div className="bg-neutral-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center mt-8">
            <CheckCircleIcon className="w-16 h-16 text-action-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-action-green-500 mb-4">{t('messageSentSuccess')}</h2>
            <p className="text-lg text-neutral-dark-gray mb-6">
                Thank you for reaching out. We appreciate your feedback.
            </p>
             <Button variant="primary" onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
          </div>
      );
  }

  return (
    <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-blue-900 mb-4 text-center">{t('supportTitle')}</h1>
      <p className="text-lg text-neutral-dark-gray text-center mb-10">{t('supportIntro')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-dark-gray border-b-2 border-gov-blue-500 pb-2">{t('supportContactInfo')}</h2>
          <div className="flex items-start space-x-4">
            <PhoneIcon className="w-8 h-8 text-gov-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold">{t('helpline')}</h3>
              <a href="tel:1800-123-4567" className="text-gov-blue-500 hover:underline text-lg">1800-123-4567</a>
              <p className="text-sm text-gray-500">Available 24/7 for urgent issues.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <EnvelopeIcon className="w-8 h-8 text-gov-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold">{t('emailSupport')}</h3>
              <a href="mailto:support@municipalcorp.gov.in" className="text-gov-blue-500 hover:underline text-lg">support@municipalcorp.gov.in</a>
              <p className="text-sm text-gray-500">We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-dark-gray border-b-2 border-gov-blue-500 pb-2 mb-6">{t('supportSendMessage')}</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input id="name" name="name" label={t('yourName')} value={formState.name} onChange={handleChange} error={errors.name} />
            <Input id="email" name="email" type="email" label={t('yourEmail')} value={formState.email} onChange={handleChange} error={errors.email} />
            <Input id="ticketId" name="ticketId" label={t('ticketIdOptional')} value={formState.ticketId} onChange={handleChange} />
            <TextArea id="message" name="message" label={t('yourMessage')} value={formState.message} onChange={handleChange} error={errors.message} rows={5} />
            <Button type="submit" variant="secondary" className="w-full text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : t('sendMessage')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
