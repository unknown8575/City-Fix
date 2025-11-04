import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { useLocalization } from '../hooks/useLocalization';
import { PhotoIcon, MapPinIcon, SparklesIcon, CheckCircleIcon } from '../constants';
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);


  useEffect(() => {
    // Cleanup object URL to prevent memory leaks
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

    // Remove highlight on edit
    if (highlightedFields.includes(name)) {
      setHighlightedFields(prev => prev.filter(field => field !== name));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof FormState; value: string };
    validateField(name, value);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAnalysisCompleted(false);
    setAnalysisError('');
    setHighlightedFields([]);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        setFormErrors(prev => ({ ...prev, photo: t('unsupportedPhotoType') }));
        setFormValid(prev => ({ ...prev, photo: false }));
        return;
      }

      if (file.size < 5 * 1024 * 1024) { // Max 5MB
        setFormData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
        setFormErrors((prev) => ({ ...prev, photo: undefined }));
        setFormValid((prev) => ({ ...prev, photo: true }));
      } else {
        setFormData((prev) => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        setFormErrors((prev) => ({ ...prev, photo: t('photoSizeError') }));
        setFormValid((prev) => ({ ...prev, photo: false }));
      }
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    setAnalysisCompleted(false);
    setAnalysisError('');
    setHighlightedFields([]);
  };
  
  const handleImageAnalysis = async () => {
    if (!formData.photo) return;
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setAnalysisError('');
    setHighlightedFields([]); // Clear previous highlights
    try {
      const result = await analyzeImage(formData.photo);
      setFormData(prev => ({
        ...prev,
        category: result.category,
        description: result.description,
      }));
      validateField('category', result.category);
      validateField('description', result.description);
      setAnalysisCompleted(true);
      setHighlightedFields(['category', 'description']); // Highlight fields
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
      <div className="bg-neutral-white p-8 rounded-lg shadow-md max-w-xl mx-auto text-center mt-8">
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
        <div className="mt-4">
            <a href="mailto:support@municipalcorp.gov.in" className="text-sm text-gov-blue-500 hover:underline">
                {t('contactSupport')}
            </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-2xl mx-auto mt-4">
      <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6 text-center">{t('submitNewComplaint')}</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        
        <fieldset className="border-t border-neutral-gray pt-4">
            <legend className="text-lg font-semibold text-neutral-dark-gray px-2 -ml-2">1. Start with a Photo (Recommended)</legend>
            <p className="text-sm text-gray-600 mb-4">Upload a photo and let our AI assist you in filling the details.</p>
            
            <div className="mt-2">
                <div className={`flex justify-center items-center w-full p-4 border-2 border-neutral-gray border-dashed rounded-lg ${!photoPreview && 'cursor-pointer hover:border-gov-blue-500'}`}>
                    <div className="space-y-1 text-center">
                        {photoPreview ? (
                            <div className="relative group">
                                <img src={photoPreview} alt="Complaint preview" className="mx-auto h-48 w-auto rounded-lg shadow-md" />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <Button type="button" variant="warning" onClick={handleRemovePhoto} className="!py-1 !px-3 text-sm">Remove</Button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="photo-upload" className="w-full cursor-pointer">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <span className="relative bg-white rounded-md font-medium text-gov-blue-500 hover:text-gov-blue-900">
                                        <span>Upload a file</span>
                                    </span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                            </label>
                        )}
                    </div>
                </div>
                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoUpload} accept="image/jpeg,image/png,image/webp" />
                 {formErrors.photo && <p className="mt-1 text-sm text-red-500" role="alert">{formErrors.photo}</p>}
            </div>

            {formData.photo && (
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    <Button type="button" variant="primary" onClick={handleImageAnalysis} disabled={isAnalyzing || analysisCompleted} className="flex items-center gap-2">
                        <SparklesIcon className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? 'Analyzing Image...' : (analysisCompleted ? 'Analysis Complete' : 'Analyze with AI')}
                    </Button>
                    {analysisCompleted && <p className="text-sm text-action-green-500 flex items-center gap-1"><CheckCircleIcon className="w-5 h-5"/>AI has filled in the details below. Please review them.</p>}
                    {analysisError && <p className="text-sm text-red-500">{analysisError}</p>}
                </div>
            )}
        </fieldset>
        
        <fieldset className="border-t border-neutral-gray pt-4">
          <legend className="text-lg font-semibold text-neutral-dark-gray px-2 -ml-2">2. Complaint Details</legend>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="category" className="block text-neutral-dark-gray text-sm font-medium mb-1">{t('complaintCategory')}</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} onBlur={handleBlur}
                disabled={isAnalyzing}
                className={`form-select mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2
                  ${formErrors.category ? 'border-red-500 focus:ring-red-500/50' : formValid.category ? 'border-action-green-500 focus:ring-gov-blue-500/50' : 'border-neutral-gray focus:ring-gov-blue-500/50'}
                  text-black bg-white ${highlightedFields.includes('category') ? 'bg-blue-100' : ''} transition-colors duration-300`}
                aria-invalid={!!formErrors.category} aria-describedby="category-error">
                {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
              {formErrors.category && <p id="category-error" className="mt-1 text-sm text-red-500" role="alert">{formErrors.category}</p>}
            </div>

            <TextArea id="description" name="description" label={t('complaintDescription')} placeholder={t('descriptionPlaceholder')}
              value={formData.description} onChange={handleChange} onBlur={handleBlur} error={formErrors.description} isValid={formValid.description} disabled={isAnalyzing}
              className={`${highlightedFields.includes('description') ? 'bg-blue-100' : ''} transition-colors duration-300`} />

            <div className="relative">
              <Input id="location" name="location" label={t('exactLocation')} placeholder={t('locationPlaceholder')}
                value={formData.location} onChange={handleChange} onBlur={handleBlur} error={formErrors.location} isValid={formValid.location}
                className="pr-12" />
              <Button type="button" onClick={handleLocationDetection}
                className="absolute right-1 top-[36px] bg-gov-blue-500 hover:bg-gov-blue-900 focus:ring-gov-blue-500/50 !p-2 rounded-lg"
                aria-label={t('detectMyLocation')} title={t('detectMyLocation')}>
                <MapPinIcon className="h-5 w-5 text-neutral-white" />
              </Button>
            </div>
          </div>
        </fieldset>

        <fieldset className="border-t border-neutral-gray pt-4">
            <legend className="text-lg font-semibold text-neutral-dark-gray px-2 -ml-2">3. Your Contact Information</legend>
            <p className="text-sm text-gray-600 mb-4">We'll send updates via SMS to this number.</p>
            <Input id="contact" name="contact" label={t('yourMobileNumber')} type="tel" placeholder="e.g., 9876543210"
                value={formData.contact} onChange={handleChange} onBlur={handleBlur} error={formErrors.contact} isValid={formValid.contact}
                maxLength={10} inputMode="numeric" />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" variant="secondary" className="w-full text-lg" disabled={submissionStatus === 'loading' || isAnalyzing}>
            {submissionStatus === 'loading' ? 'Submitting...' : t('submit')}
          </Button>
          {submissionStatus === 'error' && <p className="mt-4 text-center text-red-500">Submission failed. Please try again.</p>}
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaintPage;