import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Input, Button } from '@material-ui/core';
import { ErrorMessage } from '../widgets/ErrorMessage';

const ChangePasswordForm = ({ onSubmit }: { onSubmit: (newPassword: string) => void }) => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [t] = useTranslation();

  const onInputChange = (setter: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  function onFormSubmit(event: React.FormEvent) {
    setError('');
    event.preventDefault();
    if (password != confirmPassword) {
      setError(t('Passwords should match'));
      return;
    }
    onSubmit(password);
  }

  return (
    <div>
      <form onSubmit={onFormSubmit} style={{ width: '400px' }}>
        <FormControl required>
          <InputLabel htmlFor="password">{t('Password')}</InputLabel>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            id="password"
            onChange={onInputChange(setPassword)}
          />
        </FormControl>
        <FormControl required style={{ marginLeft: '1em' }}>
          <InputLabel htmlFor="confirm-password">{t('Confirm password')}</InputLabel>
          <Input
            name="confirm-password"
            type="password"
            autoComplete="current-password"
            id="confirm-password"
            onChange={onInputChange(setConfirmPassword)}
          />
        </FormControl>
        {error.length > 0 && (
          <div style={{ marginTop: '0.5em' }}>
            <ErrorMessage message={error} />
          </div>
        )}
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '0.5em' }}>
          {t('Update')}
        </Button>
      </form>
    </div>
  );
};

export { ChangePasswordForm };
