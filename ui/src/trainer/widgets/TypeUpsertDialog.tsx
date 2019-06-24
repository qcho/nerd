import React, { useState } from 'react';
import { CirclePicker } from 'react-color';
import {
  Button,
  Typography,
  DialogContent as MuiDialogContent,
  Dialog,
  DialogTitle,
  DialogActions,
  Grid,
  TextField,
  Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Type } from '../apigen';
import { CompleteType, MaybeCompleteType } from '../types/CompleteType';

const TypeUpsertDialog = ({
  startingType,
  open,
  onSave,
  onClose,
}: {
  startingType: CompleteType;
  open: boolean;
  onSave: (newType: CompleteType, originalType: MaybeCompleteType) => void;
  onClose: () => void;
}) => {
  const [t] = useTranslation();
  const [label, setLabel] = useState<string>(startingType.type.label);
  const [typeCode, setTypeCode] = useState<string>(startingType.code);
  const [color, setColour] = useState<string>(startingType.type.color);
  const isCreating = startingType.code == '';
  return (
    <Dialog open={open} onClose={onClose} style={{ height: '1000px' }}>
      <DialogTitle>{(!isCreating && t('Update type')) || t('Create type')}</DialogTitle>
      <MuiDialogContent>
        <Divider style={{ marginBottom: '0.5em' }} />
        <Grid container direction="column" spacing={16}>
          <Grid item>
            <TextField
              required
              label={t('Code')}
              id="type-code"
              defaultValue={typeCode}
              margin="none"
              onChange={event => setTypeCode(event.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              required
              label={t('Label')}
              id="type-label"
              defaultValue={label}
              margin="none"
              onChange={event => setLabel(event.target.value)}
            />
          </Grid>
          <Grid item>
            <Typography variant="subtitle1">{t('Colour')}</Typography>
            <CirclePicker color={color} onChangeComplete={selected => setColour(selected.hex)} />
          </Grid>
        </Grid>
      </MuiDialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Close')}</Button>
        <Button
          onClick={() =>
            onSave({ code: typeCode.toUpperCase(), type: { label, color } }, isCreating ? null : startingType)
          }
          color="primary"
        >
          {t('Ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { TypeUpsertDialog };
