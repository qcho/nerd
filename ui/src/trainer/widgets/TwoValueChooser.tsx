import React, { useState, useEffect } from 'react';

import { Button, InputBase, MenuItem, Typography, Select, FormControl } from '@material-ui/core';
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
  leftDefaultValue?: string | null;
  rightDefaultValue?: string | null;
}

const TwoValueChooser = ({
  options,
  onChoose,
  actionText = null,
  separatorText = null,
  onlyDifferentValues = false,
  leftDefaultValue = null,
  rightDefaultValue = null,
}: Props) => {
  const [t] = useTranslation();
  const [leftValue, setLeftValue] = useState<any>(leftDefaultValue || '');
  const [rightValue, setRightValue] = useState<any>(rightDefaultValue || '');
  const [leftOptions, setLeftOptions] = useState<Option[]>([]);
  const [rightOptions, setRightOptions] = useState<Option[]>([]);
  actionText = actionText || (t('Select') as string);
  separatorText = separatorText || (t('and') as string);

  function optionsToWidgets(options: Option[]) {
    return options.map(option => (
      <MenuItem value={option.value} key={option.value}>
        {option.label}
      </MenuItem>
    ));
  }

  useEffect(() => {
    if (!onlyDifferentValues) {
      setLeftOptions(options);
      setRightOptions(options);
      return;
    }
    setLeftOptions(options.filter(it => it.value == -1 || it.value != rightValue));
    setRightOptions(options.filter(it => it.value == -1 || it.value != leftValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftValue, rightValue]);

  const renderSelectValue = (selected: any) => {
    if (selected === '') return <Typography>{t('Select an option')}</Typography>;
    return <Typography>{selected}</Typography>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
      <FormControl>
        <Select
          displayEmpty
          value={leftValue}
          renderValue={selected => renderSelectValue(selected)}
          style={{ display: 'block' }}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setLeftValue(event.target.value as unknown);
          }}
        >
          {optionsToWidgets(leftOptions)}
        </Select>
      </FormControl>
      <Typography style={{ marginLeft: '1em', marginRight: '1em' }}>{separatorText}</Typography>
      <FormControl>
        <Select
          displayEmpty
          value={rightValue}
          renderValue={selected => renderSelectValue(selected)}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setRightValue(event.target.value as unknown);
          }}
        >
          {optionsToWidgets(rightOptions)}
        </Select>
      </FormControl>
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

export { TwoValueChooser };
