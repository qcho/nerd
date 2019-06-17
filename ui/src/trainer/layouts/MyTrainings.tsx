import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scaffold } from '../widgets/Scaffold';

const MyTrainings = () => {
  const [t] = useTranslation();
  return (
    <Scaffold title={t('My trainings')} loading={false}>
      {/* TODO */}
    </Scaffold>
  );
};

export { MyTrainings };
