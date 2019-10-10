import React from 'react';
import { DistinctValueChooser, Option } from '../widgets/DistinctValueChooser';

export interface ChooseResult {
  from: string;
  to: string;
}

interface Props {
  onChange: (result: ChooseResult) => any;
}

const ChooseSnapshots = ({ onChange }: Props) => {
  const options: Option[] = [{ label: 'Holis', value: 1 }];

  const onChoose = (leftValue: any, rightValue: any) => {
    console.log([leftValue, rightValue]);
  };
  return (
    <div>
      <DistinctValueChooser options={options} onChoose={onChoose} onlyDifferentValues />
    </div>
  );
};

export { ChooseSnapshots };
