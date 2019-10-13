import React from 'react';
import { DistinctValueChooser, Option } from '../widgets/DistinctValueChooser';
import { useAvailableWorkers } from '../hooks/useWorkers';

export interface ChooseResult {
  from: string;
  to: string;
}

interface Props {
  onChange: (result: ChooseResult) => any;
}

const ChooseSnapshots = ({ onChange }: Props) => {
  const { availableSnapshots } = useAvailableWorkers();

  const onChoose = (leftValue: any, rightValue: any) => {
    onChange({ from: leftValue, to: rightValue });
  };
  const options = availableSnapshots.map(it => {
    return { value: it, label: it };
  });
  return <div>{options.length > 0 && <DistinctValueChooser options={options} onChoose={onChoose} />}</div>;
};

export { ChooseSnapshots };
