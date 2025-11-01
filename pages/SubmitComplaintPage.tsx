import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { useLocalization } from '../hooks/useLocalization';
import { PhotoIcon, MapPinIcon } from '../constants';
import { submitComplaint, analyzeImage } from '../services/complaintService';

type FormState = {
  category: string;
  description: string;
  location: string;
  contact: string;
  photo: File | null;
};

const SubmitComplaintPage: React.FC = () => {
  const { t, lang } = useLocalization();
  const [formData, setFormData] = useState<FormState>({
    category: '',
    description: '',
    location: '',
    contact: '',
    photo: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formValid, setFormValid] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [analysisError, setAnalysisError] = useState('');


  const categories = [
    { value: '', label: t('selectCategory') },
    { value: 'waste_management', label: t('wasteManagement') },
    { value: 'road_maintenance', label: t('roadMaintenance') },
    { value: 'water_supply', label: t('waterSupply') },
    { value: 'street_lighting', label: t('streetLighting') },
    { value: 'public_safety', label: t('publicSafety') },
    { value: 'other', label: t('other') },
  ];

  const validateField = useCallback((name: keyof FormState, value: string | File | null): boolean => {
    let error = '';
    let isValid = false;

    switch (name) {
      case 'category':
        if (!value) error = t('categoryRequired');
        break;
      case 'description':
        if (typeof value === 'string' && value.length < 10) error = t('descriptionMinLength');
        break;
      case 'location':
        if (!value) error = t('locationRequired');
        break;
      case 'contact':
        if (typeof value === 'string' && !/^[6-9]\d{9}$/.test(value)) error = t('validMobileRequired');
        break;
      default:
        break;
    }
    
    isValid = !error;
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    setFormValid((prev) => ({ ...prev, [name]: isValid }));
    return isValid;
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof FormState; value: string };
    validateField(name, value);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAnalysisCompleted(false); // Reset analysis state on new photo upload
    setAnalysisError(''); // Also reset error state
    if (file) {
      if (file.size < 5 * 1024 * 1024) { // Max 5MB
        setFormData((prev) => ({ ...prev, photo: file }));
        setFormErrors((prev) => ({ ...prev, photo: undefined }));
        setFormValid((prev) => ({ ...prev, photo: true }));
      } else {
        setFormData((prev) => ({ ...prev, photo: null }));
        setFormErrors((prev) => ({ ...prev, photo: t('photoSizeError') }));
        setFormValid((prev) => ({ ...prev, photo: false }));
      }
    }
  };
  
  const handleImageAnalysis = async () => {
    if (!formData.photo) return;
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setAnalysisError('');
    try {
      const result = await analyzeImage(formData.photo);
      setFormData(prev => ({
        ...prev,
        category: result.category,
        description: result.description,
      }));
      // Trigger validation for the autofilled fields
      validateField('category', result.category);
      validateField('description', result.description);
      setAnalysisCompleted(true);
    } catch (error) {
      console.error("AI analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isCategoryValid = validateField('category', formData.category);
    const isDescriptionValid = validateField('description', formData.description);
    const isLocationValid = validateField('location', formData.location);
    const isContactValid = validateField('contact', formData.contact);

    if (!isCategoryValid || !isDescriptionValid || !isLocationValid || !isContactValid) {
      return;
    }
    
    setSubmissionStatus('loading');
    
    const complaintPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        // FIX: Use explicit type guards to help TypeScript resolve the correct overload for FormData.append.
        // The value from Object.entries can be `any` or `unknown`, so `else` is not a sufficient type guard.
        if (typeof value === 'string') {
          complaintPayload.append(key, value);
        } else if (value instanceof File) {
          complaintPayload.append(key, value);
        }
      }
    });
    complaintPayload.append('language', lang);

    try {
      const result = await submitComplaint(complaintPayload);
      setTicketId(result.ticketId);
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmissionStatus('error');
    }
  };

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // This would be a call to a reverse geocoding API
                const address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (Mock Address)`;
                setFormData((prev) => ({ ...prev, location: address }));
                validateField('location', address);
            },
            () => setFormErrors((prev) => ({ ...prev, location: t('locationPermissionDenied') }))
        );
    } else {
        setFormErrors((prev) => ({ ...prev, location: t('geolocationNotSupported') }));
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="bg-neutral-white p-8 rounded-lg shadow-md max-w-xl mx-auto text-center mt-8 animated-section">
        <h2 className="text-3xl font-bold text-action-green-500 mb-4">{t('complaintSubmittedSuccess')}</h2>
        <p className="text-lg text-neutral-dark-gray mb-6">
          {t('yourComplaintIDIs')} <span className="font-bold text-gov-blue-900">{ticketId}</span>.
          {' '}{t('youWillReceiveSMS')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={`/track?ticketId=${ticketId}`} className="button-link">
                <Button variant="primary" className="w-full">{t('trackMyComplaint')}</Button>
            </Link>
            <Link to="/" className="button-link">
                <Button variant="outline" className="w-full">{t('backToHome')}</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-xl mx-auto mt-4 animated-section">
      <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6 text-center">{t('submitNewComplaint')}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="category" className="block text-neutral-dark-gray text-sm font-medium mb-1">{t('complaintCategory')}</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} onBlur={handleBlur}
            disabled={isAnalyzing}
            className={`form-select mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2
              ${formErrors.category ? 'border-red-500 focus:ring-red-500/50' : formValid.category ? 'border-action-green-500 focus:ring-gov-blue-500/50' : 'border-neutral-gray focus:ring-gov-blue-500/50'}
              text-black bg-white`}
            aria-invalid={!!formErrors.category} aria-describedby="category-error">
            {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          {formErrors.category && <p id="category-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.category}</p>}
        </div>

        <TextArea id="description" name="description" label={t('complaintDescription')} placeholder={t('descriptionPlaceholder')}
          value={formData.description} onChange={handleChange} onBlur={handleBlur} error={formErrors.description} isValid={formValid.description} disabled={isAnalyzing}/>

        <div className="relative mb-4">
          <Input id="location" name="location" label={t('exactLocation')} placeholder={t('locationPlaceholder')}
            value={formData.location} onChange={handleChange} onBlur={handleBlur} error={formErrors.location} isValid={formValid.location}
            className="pr-12" />
          <Button type="button" onClick={handleLocationDetection}
            className="absolute right-1 top-[36px] bg-gov-blue-500 hover:bg-gov-blue-900 focus:ring-gov-blue-500/50 !p-2 rounded-lg"
            aria-label={t('detectMyLocation')} title={t('detectMyLocation')}>
            <MapPinIcon className="h-5 w-5 text-neutral-white" />
          </Button>
        </div>

        <Input id="contact" name="contact" label={t('yourMobileNumber')} type="tel" placeholder="e.g., 9876543210"
          value={formData.contact} onChange={handleChange} onBlur={handleBlur} error={formErrors.contact} isValid={formValid.contact}
          maxLength={10} inputMode="numeric" />

        <div className="mb-6">
            <label htmlFor="photo-upload" className="block text-neutral-dark-gray text-sm font-medium mb-1">{t('uploadPhotoOptional')}</label>
            <div className="flex items-center space-x-4 mt-1">
                <label htmlFor="photo-upload" className="cursor-pointer bg-neutral-gray hover:bg-neutral-gray/80 text-gov-blue-900 font-medium py-2 px-4 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px]">
                    <PhotoIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span>{formData.photo ? t('photoSelected') : t('chooseFile')}</span>
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label={t('uploadPhotoOptional')} />
                {formData.photo && (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-neutral-dark-gray truncate">{formData.photo.name}</span>
                        <Button type="button" variant="primary" onClick={handleImageAnalysis} disabled={isAnalyzing} className="!py-1 !px-3 text-sm">
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                    </div>
                )}
            </div>
            {analysisCompleted && <p className="mt-2 text-sm text-action-green-500">AI analysis complete. Please review the details.</p>}
            {analysisError && <p className="mt-2 text-sm text-red-500">{analysisError}</p>}
            {formErrors.photo && <p className="mt-1 text-sm text-red-500" role="alert">{formErrors.photo}</p>}
        </div>

        <Button type="submit" variant="secondary" className="w-full text-lg" disabled={submissionStatus === 'loading' || isAnalyzing}>
          {submissionStatus === 'loading' ? 'Submitting...' : t('submit')}
        </Button>
        {submissionStatus === 'error' && <p className="mt-4 text-center text-red-500">Submission failed. Please try again.</p>}
      </form>
    </div>
  );
};

export default SubmitComplaintPage;