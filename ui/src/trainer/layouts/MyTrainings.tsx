import React from 'react';
import NavigationBar from '../NavigationBar';
import { useTranslation } from 'react-i18next';

const MyTrainings = () => {
  const [t] = useTranslation();
  return (
    <div>
      <NavigationBar title={t('My trainings')} loading={false} />
    </div>
  );
};

export { MyTrainings };
