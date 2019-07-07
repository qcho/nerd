import React, { useState } from 'react';
import { MenuItem, DialogContent, Divider, Typography, Theme, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Type } from '../apigen';
import { makeStyles } from '@material-ui/styles';

interface ActionWidgetProps {
  selected?: boolean;
  key?: string | number;
  value?: string | number | string[];
  onClick: () => void;
  label: string;
  color?: 'default' | 'secondary';
  style?: React.CSSProperties;
  variant?: 'outlined' | 'raised';
}

const useActionStyles = makeStyles(
  (theme: Theme) => ({
    action: {
      fontSize: '1.5em',
    },
  }),
  { withTheme: true },
);

const ActionWidget = ({ onClick, label, color, style, key, variant }: ActionWidgetProps) => {
  const classes = useActionStyles();
  return (
    <Button key={key} onClick={onClick} variant={variant} color={color}>
      <Typography className={classes.action} style={style} color="inherit">
        {label}
      </Typography>
    </Button>
  );
};

interface Props {
  value: string;
  onTypeChange: (value: string) => void;
  onDelete: () => void;
  onJoinLeft?: (() => void) | null | false;
  onJoinRight?: (() => void) | null | false;
  onRemove?: (() => void) | null;
  typeOptions: { [key: string]: Type };
}

const TokenDialog = ({
  value,
  typeOptions,
  onTypeChange,
  onDelete,
  onJoinLeft = null,
  onJoinRight = null,
  onRemove = null,
}: Props) => {
  const [t] = useTranslation();

  const options = Object.keys(typeOptions).map((code: string) => (
    <ActionWidget
      key={code}
      value={code}
      onClick={() => onTypeChange(code)}
      selected={code == value}
      style={{ color: typeOptions[code].color }}
      label={typeOptions[code].label}
      variant={value == code ? 'outlined' : undefined}
    />
  ));

  return (
    <DialogContent>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>{options}</div>
          <Divider style={{ marginTop: '0.5em', marginBottom: '0.5em' }} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {onJoinLeft && <ActionWidget onClick={onJoinLeft} label={t('< Join with previous')} />}
            {onJoinRight && <ActionWidget onClick={onJoinRight} label={t('Join with next >')} />}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '2em' }}>
          {onRemove && <ActionWidget onClick={onRemove} label={t('Remove')} color="secondary" />}
          {onDelete && <ActionWidget onClick={onDelete} label={t('Delete')} color="secondary" variant="raised" />}
        </div>
      </div>
    </DialogContent>
  );
};

export { TokenDialog };
