import React, { useState, useEffect } from 'react';
import { Scaffold } from '../scaffold/Scaffold';
import { useTranslation } from 'react-i18next';
import { ChooseSnapshots, ChooseResult } from './ChooseSnapshots';

const CompareSnapshots = () => {
  const [t] = useTranslation();
  const [snapshotsToCompare, setSnapshotsToCompare] = useState<ChooseResult | null>(null);

  useEffect(() => {
    async function loadWorkers() {}
  }, []);

  return (
    <Scaffold title={t('Compare snapshots')}>
      <div>
        <div>
          <ChooseSnapshots onChange={setSnapshotsToCompare} />
        </div>
        <div>{/* Results with pagination */}</div>
      </div>
    </Scaffold>
  );
};

export { CompareSnapshots };
