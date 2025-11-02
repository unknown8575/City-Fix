import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import Input from '../components/Input';
import Button from '../components/Button';
import { ArrowRightOnRectangleIcon } from '../constants';
import { indianMunicipalities } from '../data/municipalities';
import Select from '../components/Select';

const LoginPage: React.FC = () => {
  const { t } = useLocalization();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    municipality: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { municipality, password } = formData;
    if (!municipality || !password) {
      setError(t('allFieldsRequired'));
      return;
    }

    setError('');
    // In a real app, you'd make an API call here.
    // For this prototype, we'll just log in successfully.
    login();
    navigate('/admin');
  };

  return (
    <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md max-w-lg mx-auto mt-8">
      <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6 text-center">{t('municipalityLogin')}</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Select
          id="municipality"
          label={t('municipalityName')}
          options={indianMunicipalities}
          value={formData.municipality}
          onChange={(value) => setFormData(prev => ({ ...prev, municipality: value }))}
          placeholder={t('selectMunicipality')}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          value={formData.password}
          onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
          required
        />
        
        {error && <p className="text-sm text-red-500 text-center" role="alert">{error}</p>}
        
        <Button type="submit" variant="primary" className="w-full text-lg flex items-center justify-center gap-2">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            {t('login')}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
