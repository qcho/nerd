import React, { useState, useEffect } from 'react';

import { Button, InputBase, MenuItem, Typography, Select } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface Option {
  value: any;
  label: string;
}

interface Props {
  options: Option[];
  onChoose: (leftValue: any, rightValue: any) => any;
  actionText?: string | null;
  separatorText?: string | null;
  onlyDifferentValues?: boolean;
}

const DistinctValueChooser = ({
  options,
  onChoose,
  actionText = null,
  separatorText = null,
  onlyDifferentValues = false,
}: Props) => {
  const [t] = useTranslation();
  const [leftValue, setLeftValue] = useState<any>(-1);
  const [rightValue, setRightValue] = useState<any>(-1);
  const [leftOptions, setLeftOptions] = useState<Option[]>([]);
  const [rightOptions, setRightOptions] = useState<Option[]>([]);
  actionText = actionText || (t('Select') as string);
  separatorText = separatorText || (t('and') as string);

  const selectAnOption: Option = {
    value: -1,
    label: t('Select an option') as string,
  };

  function optionsToWidgets(options: Option[]) {
    return options.map(option => (
      <MenuItem value={option.value} key={option.value}>
        {option.label}
      </MenuItem>
    ));
  }

  const allOptions = [selectAnOption];
  allOptions.push(...options);

  useEffect(() => {
    if (!onlyDifferentValues) {
      setLeftOptions(allOptions);
      setRightOptions(allOptions);
      return;
    }
    setLeftOptions(allOptions.filter(it => it.value == -1 || it.value != rightValue));
    setRightOptions(allOptions.filter(it => it.value == -1 || it.value != leftValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftValue, rightValue]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
      <div>
        <Select
          fullWidth
          style={{ display: 'block' }}
          value={leftValue}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setLeftValue(event.target.value as unknown);
          }}
        >
          {optionsToWidgets(leftOptions)}
        </Select>
      </div>
      <Typography style={{ marginLeft: '1em', marginRight: '1em' }}>{separatorText}</Typography>
      <div>
        <Select
          displayEmpty
          value={rightValue}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setRightValue(event.target.value as unknown);
          }}
        >
          {optionsToWidgets(rightOptions)}
        </Select>
      </div>
      <div>
        <Button
          style={{ marginLeft: '1em' }}
          onClick={() => {
            onChoose(leftValue, rightValue);
          }}
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
};

export { DistinctValueChooser };
