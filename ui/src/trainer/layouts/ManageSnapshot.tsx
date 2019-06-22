import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { CirclePicker } from 'react-color';
import {
  Paper,
  Chip,
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
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { SnapshotInfo, Type, SnapshotsApi } from '../apigen';
import { MaybeType } from '../types/optionals';
import { apiConfig } from '../helpers/api-config';

const TypeAvatar = ({ code, color }: { code: string; color: string }) => {
  return (
    <div
      style={{
        height: '100%',
        // borderRight: `1px solid ${color}`,
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
        display: 'flex',
        // backgroundColor: grey[400],
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: color,
          fontWeight: 'bold',
          paddingLeft: '0.7em',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {code}
      </span>
    </div>
  );
};

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

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error, createSnapshot, updateCurrentSnapshot } = useCurrentSnapshot();
  const [currentType, setCurrentType] = useState<MaybeType>(null);
  const [currentTypeCode, setCurrentTypeCode] = useState<string>('');

  function mapSnapshotTypes(
    snapshotInfo: SnapshotInfo,
    onDelete: (type: Type, code: string) => void,
    onClick: (type: Type, code: string) => void,
  ) {
    const types = snapshotInfo.snapshot.types || {};
    return Object.keys(types).map(code => {
      const type = types[code];
      return (
        <Chip
          onClick={() => onClick(type, code)}
          style={{ marginRight: '1em', marginTop: '0.3em', marginBottom: '0.2em' }}
          key={code}
          avatar={<TypeAvatar code={code} color={type.color} />}
          label={<Typography>{type.label}</Typography>}
          variant="outlined"
          onDelete={() => onDelete(type, code)}
        />
      );
    });
  }

  function onTypeDelete(type: Type, code: string) {
    return;
  }

  function onTypeClick(type: Type, code: string) {
    setCurrentType(type);
    setCurrentTypeCode(code);
  }

  async function onTypeSave(code: string, label: string, color: string, isCreating: boolean) {
    setCurrentType(null);
    setCurrentTypeCode('');
    if (!currentSnapshot) return;
    const upperCaseCode = code.toUpperCase();
    const types = currentSnapshot.snapshot.types || {};
    if (isCreating) {
      if (types[upperCaseCode] !== undefined) {
        // TODO: Error since `code` is being used
        return;
      }
    }
    types[upperCaseCode] = { label, color };
    const snapshot = currentSnapshot.snapshot;
    snapshot.types = types;
  }

  function onCreateSnapshotClick() {
    createSnapshot();
  }

  function onTypeCreateClick() {
    setCurrentType({ label: '', color: '' });
    setCurrentTypeCode('');
  }

  return (
    <div>
      <Grid container spacing={8} direction="column">
        <Grid item>
          <Title>{t('Create snapshot')}</Title>
        </Grid>
      </Grid>
      {!loading && !error && currentSnapshot && (
        <Paper style={{ padding: '1em', marginTop: '1em', marginBottom: '1em' }}>
          {mapSnapshotTypes(currentSnapshot, onTypeDelete, onTypeClick)}
          <Button color="primary" size="small" variant="outlined" onClick={onTypeCreateClick}>
            {t('New')}
          </Button>
        </Paper>
      )}
      <Grid item>
        <Button color="secondary" variant="outlined" onClick={onCreateSnapshotClick}>
          {t('Create')}
        </Button>
      </Grid>
      {currentType && (
        <TypeUpsertDialog
          open={currentType != null}
          startingType={currentType}
          startingTypeCode={currentTypeCode}
          onSave={onTypeSave}
          onClose={() => setCurrentType(null)}
        />
      )}
    </div>
  );
};

export { ManageSnapshot };
