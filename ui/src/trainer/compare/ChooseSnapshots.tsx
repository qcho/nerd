import React from 'react';
import { TwoValueChooser } from '../widgets/TwoValueChooser';
import { useAvailableWorkers } from '../hooks/useWorkers';
import { useTranslation } from 'react-i18next';

export interface ChooseResult {
  from: string;
  to: string;
}

interface Props {
  onChange: (result: ChooseResult) => any;
  value: ChooseResult;
}

const ChooseSnapshots = ({ onChange, value }: Props) => {
  const { availableSnapshots } = useAvailableWorkers();
  const [t] = useTranslation();

  const onChoose = (leftValue: any, rightValue: any) => {
    onChange({ from: leftValue, to: rightValue });
  };
  const options = availableSnapshots.map(it => {
    return { value: it, label: it };
  });
  return (
    <div>
      {options.length > 0 && (
        <TwoValueChooser
          options={options}
          onChoose={onChoose}
          actionText={t('Compare') as string}
          leftDefaultValue={value.from}
          rightDefaultValue={value.to}
        />
      )}
    </div>
  );
};

export { ChooseSnapshots };
