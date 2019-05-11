import React, { useState } from 'react';
import { MenuItem, DialogContent, Select, Divider, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Type } from '../apigen';

interface Props {
  value: string;
  onTypeChange: (value: string) => void;
  onDelete: () => void;
  onJoinLeft?: (() => void) | null;
  onJoinRight?: (() => void) | null;
  onRemove?: (() => void) | null;
  typeOptions: { [key: string]: Type };
}

const joinLeftAction = 'action-join-left';
const joinRightAction = 'action-join-Right';
const removeAction = 'action-remove';
const deleteAction = 'action-delete';

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
  const [open, setOpen] = useState<boolean>(true);
  const actions = [
    onJoinLeft && (
      <MenuItem key={joinLeftAction} value={joinLeftAction}>
        {t('< Join')}
      </MenuItem>
    ),
    onJoinRight && (
      <MenuItem key={joinRightAction} value={joinRightAction}>
        {t('Join >')}
      </MenuItem>
    ),
    onRemove && (
      <MenuItem key={removeAction} value={removeAction}>
        {t('Remove')}
      </MenuItem>
    ),
    onDelete && (
      <MenuItem key={deleteAction} value={deleteAction}>
        {t('Delete')}
      </MenuItem>
    ),
  ].filter(value => value);
  const options = Object.keys(typeOptions).map((code: string) => (
    <MenuItem key={code} value={code}>
      {<span style={{ color: typeOptions[code].color }}>{typeOptions[code].label}</span>}
    </MenuItem>
  ));

  const selectWidgets = [...options, actions.length > 0 && <Divider key="divider" />, ...actions];

  const onSelect = (value: string) => {
    if (value == joinRightAction && onJoinRight) {
      onJoinRight();
      return;
    }
    if (value == joinLeftAction && onJoinLeft) {
      onJoinLeft();
      return;
    }
    if (value == deleteAction && onDelete) {
      onDelete();
      return;
    }
    if (value == removeAction && onRemove) {
      onRemove();
      return;
    }
    if (onTypeChange) {
      onTypeChange(value);
    }
  };

  return (
    <DialogContent>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Select
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            value={value || 'MISC'}
            onChange={(event: any) => onSelect(event.target.value)}
          >
            {selectWidgets}
          </Select>
          <Button style={{ marginLeft: '1em' }} color="secondary" onClick={() => onDelete()}>
            Remove
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export { TokenDialog };
