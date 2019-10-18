import React, { useState, ChangeEvent } from 'react';
import { Scaffold } from '../scaffold/Scaffold';
import { useTranslation } from 'react-i18next';
import { ChooseSnapshots, ChooseResult } from './ChooseSnapshots';
import { FormControlLabel, Switch } from '@material-ui/core';
import { CompareTable } from './CompareTable';

const CompareSnapshots = () => {
  const [t] = useTranslation();
  const [snapshotsToCompare, setSnapshotsToCompare] = useState<ChooseResult | null>(null);
  const [highlightDifferent, setHighlightDifferent] = useState<boolean>(true);

  const onHDSwitchChange = (event: ChangeEvent, checked: boolean) => {
    setHighlightDifferent(checked);
  };

  return (
    <Scaffold title={t('Compare snapshots')}>
      <div>
        <div>
          <ChooseSnapshots onChange={setSnapshotsToCompare} value={{ from: 'v1', to: 'vCURRENT' }} />
          <FormControlLabel
            checked={highlightDifferent}
            label={t('Highlight different')}
            labelPlacement="start"
            control={<Switch color="primary" onChange={onHDSwitchChange} />}
          />
        </div>
        <div>
          {snapshotsToCompare != null && (
            <CompareTable
              firstSnapshotVersion={snapshotsToCompare.from}
              secondSnapshotVersion={snapshotsToCompare.to}
              highlightDifferent={highlightDifferent}
            />
          )}
        </div>
      </div>
    </Scaffold>
  );
};

export { CompareSnapshots };
