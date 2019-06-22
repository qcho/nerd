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

const TypeUpsertDialog = ({
  startingType,
  startingTypeCode,
  open,
  onSave,
  onClose,
}: {
  startingType: Type;
  startingTypeCode: string;
  open: boolean;
  onSave: (code: string, label: string, color: string, isCreating: boolean) => void;
  onClose: () => void;
}) => {
  const [t] = useTranslation();
  const [label, setLabel] = useState<string>(startingType.label);
  const [typeCode, setTypeCode] = useState<string>(startingTypeCode);
  const [colour, setColour] = useState<string>(startingType.color);
  const isCreating = startingTypeCode == '';
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
            <Typography variant="subheading">{t('Colour')}</Typography>
            <CirclePicker color={colour} onChangeComplete={selected => setColour(selected.hex)} />
          </Grid>
        </Grid>
      </MuiDialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Close')}</Button>
        <Button onClick={() => onSave(typeCode, label, colour, isCreating)} color="primary">
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { TypeUpsertDialog };
