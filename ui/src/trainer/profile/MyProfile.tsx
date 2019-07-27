import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scaffold } from '../widgets/Scaffold';

const MyProfile = () => {
  const [t] = useTranslation();
  return (
    <Scaffold title={t('Profile')} loading={false}>
      {/* TODO */}
    </Scaffold>
  );
};

export { MyProfile };
