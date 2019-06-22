import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Chip, Button, Typography, Grid } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { SnapshotInfo, Type } from '../apigen';
import { MaybeType } from '../types/optionals';
import { TypeAvatar } from '../widgets/TypeAvatar';
import { TypeUpsertDialog } from '../widgets/TypeUpsertDialog';

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

  async function onCreateSnapshotClick() {
    await createSnapshot();
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
