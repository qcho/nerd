import React, { useState } from 'react';
import { DialogContent, Divider, Typography, Theme, Button, List } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Type } from '../apigen';
import { makeStyles } from '@material-ui/styles';

interface ActionWidgetProps {
  key: string | number | undefined;
  selected?: boolean;
  value?: string | number | string[];
  onClick: () => void;
  label: string;
  color?: 'default' | 'secondary';
  style?: React.CSSProperties;
  variant?: 'outlined' | 'contained';
  onMouseOver?: (() => void) | undefined;
}

const useActionStyles = makeStyles(
  (theme: Theme) => ({
    action: {
      fontSize: '1.5em',
    },
  }),
  { withTheme: true },
);

const ActionWidget = ({ onClick, onMouseOver, label, color, style, key, variant }: ActionWidgetProps) => {
  const classes = useActionStyles();
  return (
    <Button key={key} onClick={onClick} variant={variant} color={color} onMouseOver={onMouseOver}>
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
  nextEntityText?: string | null | undefined;
  previousEntityText?: string | null | undefined;
}

const TokenDialog = ({
  value,
  typeOptions,
  onTypeChange,
  onDelete,
  onJoinLeft = null,
  onJoinRight = null,
  onRemove = null,
  previousEntityText = null,
  nextEntityText = null,
}: Props) => {
  const [t] = useTranslation();
  const [description, setDescription] = useState<string>(typeOptions[value].description);

  var options = Object.keys(typeOptions).map((code: string) => {
    return (
      <ActionWidget
        key={code}
        value={code}
        onClick={() => onTypeChange(code)}
        selected={code == value}
        style={{ color: typeOptions[code].color }}
        label={typeOptions[code].label}
        variant={value == code ? 'outlined' : undefined}
        onMouseOver={() => setDescription(typeOptions[code].description)}
      />
    );
  });
  if (onJoinLeft || onJoinRight) {
    options.push(<Divider key="divider" style={{ marginTop: '0.5em', marginBottom: '0.5em' }} />);
  }

  return (
    <DialogContent>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <List
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              maxHeight: '340px',
              maxWidth: '400px',
              overflow: 'auto',
              justifyContent: 'space-around',
            }}
          >
            {options}
          </List>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginLeft: '2em',
            }}
          >
            {onRemove && <ActionWidget key="remove" onClick={onRemove} label={t('Remove')} color="secondary" />}
            {onDelete && (
              <ActionWidget key="delete" onClick={onDelete} label={t('Delete')} color="secondary" variant="contained" />
            )}
          </div>
        </div>
        {description.length > 0 && (
          <div style={{ maxWidth: '400px', marginBottom: '5px' }}>
            <Divider />
            <Typography variant="subtitle1" color="textSecondary">
              {description}
            </Typography>
            <Divider />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {onJoinLeft && (
            <ActionWidget
              key="join-previous"
              onClick={onJoinLeft}
              label={t('< Join with {{previousEntityText}}', { previousEntityText })}
            />
          )}
          {onJoinRight && (
            <ActionWidget
              key="join-next"
              onClick={onJoinRight}
              label={t('Join with {{nextEntityText}} >', { nextEntityText })}
            />
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export { TokenDialog };
